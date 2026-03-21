const { v4: uuidv4 } = require('uuid');
const { Order, OrderDepartmentStatus, OrderPdf, Printer, PrintJob } = require('../models');
const { generatePdf } = require('./pdfGenerator');
const timelineService = require('./timelineService');
const { getIO } = require('../config/socket');

async function triggerPrint(orderId, department, templateType = 'standard', isRetry = false) {
  const order = await Order.findByOrderId(orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (order.is_ignored) {
    throw new Error('Cannot print ignored order');
  }
  
  if (order.is_cancelled) {
    throw new Error('Cannot print cancelled order');
  }
  
  const printer = await Printer.findByDepartment(department);
  
  if (!printer) {
    await OrderDepartmentStatus.updateStatus(orderId, department, 'FAILED');
    await timelineService.logPrinterValidationFailed(orderId, department, 'No printer assigned to department');
    
    notifyFrontend(orderId, department, 'FAILED');
    
    return {
      success: false,
      message: 'Printer validation failed: no printer assigned to department',
      status: 'FAILED'
    };
  }
  
  if (!printer.is_active) {
    await OrderDepartmentStatus.updateStatus(orderId, department, 'FAILED');
    await timelineService.logPrinterValidationFailed(orderId, department, 'Printer is inactive');
    
    notifyFrontend(orderId, department, 'FAILED');
    
    return {
      success: false,
      message: 'Printer validation failed: printer is inactive',
      status: 'FAILED'
    };
  }
  
  if (printer.status !== 'online') {
    await OrderDepartmentStatus.updateStatus(orderId, department, 'FAILED');
    await timelineService.logPrinterValidationFailed(orderId, department, 'Printer is offline');
    
    notifyFrontend(orderId, department, 'FAILED');
    
    return {
      success: false,
      message: 'Printer validation failed: printer is offline',
      status: 'FAILED'
    };
  }
  
  const actualTemplateType = isRetry ? 'reprint' : templateType;
  
  let pdfRecord = await OrderPdf.findByOrderAndDepartment(orderId, department, actualTemplateType);
  
  if (!pdfRecord) {
    const orderDetail = await Order.getOrderDetail(orderId);
    const pdfResult = await generatePdf(orderDetail.order, department, actualTemplateType);
    
    await OrderPdf.create({
      order_id: orderId,
      department,
      template_type: actualTemplateType,
      pdf_path: pdfResult.relativePath
    });
    
    pdfRecord = await OrderPdf.findByOrderAndDepartment(orderId, department, actualTemplateType);
    await timelineService.logPdfGenerated(orderId, department);
  }
  
  const jobId = uuidv4();
  
  await PrintJob.create({
    job_id: jobId,
    order_id: orderId,
    department,
    printer_id: printer.printer_id,
    template_type: actualTemplateType,
    status: 'QUEUED'
  });
  
  await OrderDepartmentStatus.updateStatus(orderId, department, 'IN-PROGRESS');
  await timelineService.logPrintTriggered(orderId, department, printer.printer_name);
  
  notifyFrontend(orderId, department, 'IN-PROGRESS');
  
  dispatchToElectron({
    job_id: jobId,
    order_id: orderId,
    department,
    printer_name: printer.printer_name,
    pdf_url: `/api/orders/${orderId}/departments/${department}/download-pdf`,
    template_type: actualTemplateType
  });
  
  return {
    success: true,
    message: 'Print job dispatched',
    data: {
      job_id: jobId,
      order_id: orderId,
      department,
      printer: printer.printer_name,
      status: 'IN-PROGRESS'
    }
  };
}

async function handlePrintResult(jobId, status, message) {
  const job = await PrintJob.findByJobId(jobId);
  
  if (!job) {
    console.error(`Print job not found: ${jobId}`);
    return;
  }
  
  const finalStatus = status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';
  
  await PrintJob.updateStatus(jobId, finalStatus, status === 'FAILED' ? message : null);
  await OrderDepartmentStatus.updateStatus(job.order_id, job.department, finalStatus);
  
  await timelineService.logPrintResult(
    job.order_id,
    job.department,
    finalStatus,
    message || (finalStatus === 'SUCCESS' ? 'Print completed successfully' : 'Print failed')
  );
  
  notifyFrontend(job.order_id, job.department, finalStatus);
}

async function cancelPrintJobs(orderId) {
  const cancelledCount = await PrintJob.cancelPendingJobs(orderId);
  
  const jobs = await PrintJob.findByOrderId(orderId);
  const cancelledJobs = jobs.filter(j => j.status === 'CANCELLED');
  
  for (const job of cancelledJobs) {
    await timelineService.logPrintCancelled(orderId, job.department);
    
    try {
      const io = getIO();
      io.to('electron').emit('cancel_job', { job_id: job.job_id });
    } catch (error) {
      console.error('Failed to notify Electron of job cancellation:', error);
    }
  }
  
  return cancelledCount;
}

function dispatchToElectron(jobData) {
  try {
    const io = getIO();
    io.to('electron').emit('print_job', jobData);
  } catch (error) {
    console.error('Failed to dispatch print job to Electron:', error);
  }
}

function notifyFrontend(orderId, department, status) {
  try {
    const io = getIO();
    io.emit('order_status_update', {
      order_id: orderId,
      department,
      status
    });
  } catch (error) {
    console.error('Failed to notify frontend:', error);
  }
}

module.exports = {
  triggerPrint,
  handlePrintResult,
  cancelPrintJobs,
  notifyFrontend
};
