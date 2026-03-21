const statusElement = document.getElementById('connection-status');
const printerListElement = document.getElementById('printer-list');
const jobListElement = document.getElementById('job-list');

function updateConnectionStatus(status) {
  statusElement.className = `status ${status}`;
  statusElement.innerHTML = `
    <span class="status-dot"></span>
    <span>${status.charAt(0).toUpperCase() + status.slice(1)}</span>
  `;
}

function updatePrinterList(printers) {
  if (!printers || printers.length === 0) {
    printerListElement.innerHTML = '<li class="empty">No printers detected</li>';
    return;
  }
  
  printerListElement.innerHTML = printers.map(printer => `
    <li class="printer-item">
      <span class="printer-name">${printer.printer_name}${printer.is_default ? ' (Default)' : ''}</span>
      <span class="printer-status ${printer.status}">${printer.status}</span>
    </li>
  `).join('');
}

function updateJobList(jobs) {
  if (!jobs || jobs.length === 0) {
    jobListElement.innerHTML = '<li class="empty">No recent jobs</li>';
    return;
  }
  
  const sortedJobs = [...jobs].reverse();
  
  jobListElement.innerHTML = sortedJobs.map(job => `
    <li class="job-item">
      <span class="job-id">${job.job_id?.slice(0, 8) || 'N/A'}...</span>
      <span class="job-status ${job.status || ''}">${job.status || 'Unknown'}</span>
      <span>${job.department || ''}</span>
    </li>
  `).join('');
}

async function initialize() {
  try {
    const status = await window.electronAPI.getConnectionStatus();
    updateConnectionStatus(status);
    
    const printers = await window.electronAPI.getPrinters();
    updatePrinterList(printers);
    
    const jobs = await window.electronAPI.getRecentJobs();
    updateJobList(jobs);
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
}

window.electronAPI.onStatusUpdate((data) => {
  updateConnectionStatus(data.status);
});

window.electronAPI.onPrintersUpdate((data) => {
  updatePrinterList(data.printers);
});

window.electronAPI.onJobUpdate((data) => {
  updateJobList(data.jobs);
});

initialize();

setInterval(async () => {
  try {
    const printers = await window.electronAPI.getPrinters();
    updatePrinterList(printers);
  } catch (error) {
    console.error('Failed to refresh printers:', error);
  }
}, 10000);
