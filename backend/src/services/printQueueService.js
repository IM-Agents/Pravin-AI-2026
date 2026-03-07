const Queue = require('bull');
const Redis = require('ioredis');
const printerService = require('./printerService');
const timelineService = require('./timelineService');
const { Order } = require('../models');
const logger = require('../utils/logger');

class PrintQueueService {
  constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    };

    this.dmQueue = new Queue('dm-print-queue', { redis: redisConfig });
    this.confectioneryQueue = new Queue('confectionery-print-queue', { redis: redisConfig });
    this.designQueue = new Queue('design-print-queue', { redis: redisConfig });

    this.setupProcessors();
    this.setupEventHandlers();
  }

  setupProcessors() {
    this.dmQueue.process(async (job) => {
      return this.processPrintJob(job, 'DM');
    });

    this.confectioneryQueue.process(async (job) => {
      return this.processPrintJob(job, 'CONFECTIONERY');
    });

    this.designQueue.process(async (job) => {
      return this.processPrintJob(job, 'DESIGN');
    });
  }

  setupEventHandlers() {
    const queues = [
      { queue: this.dmQueue, name: 'DM' },
      { queue: this.confectioneryQueue, name: 'CONFECTIONERY' },
      { queue: this.designQueue, name: 'DESIGN' }
    ];

    queues.forEach(({ queue, name }) => {
      queue.on('completed', (job) => {
        logger.info(`${name} print job ${job.id} completed`);
      });

      queue.on('failed', (job, err) => {
        logger.error(`${name} print job ${job.id} failed:`, err);
      });

      queue.on('stalled', (job) => {
        logger.warn(`${name} print job ${job.id} stalled`);
      });
    });
  }

  async processPrintJob(job, department) {
    const { orderId, pdfPath, storeClientId } = job.data;

    try {
      logger.info(`Processing print job for order ${orderId}, department: ${department}`);

      const printerConfig = await printerService.getPrinterConfig(storeClientId, department);

      if (!printerConfig) {
        throw new Error(`No printer configured for ${department}`);
      }

      if (!printerConfig.is_active) {
        throw new Error(`Printer for ${department} is not active`);
      }

      const statusCheck = await printerService.checkPrinterStatus(printerConfig.printer_name);
      
      if (!statusCheck.online) {
        throw new Error(`Printer ${printerConfig.printer_name} is offline`);
      }

      const printResult = await printerService.printPDF(
        printerConfig.printer_name,
        pdfPath,
        printerConfig.printer_settings || {}
      );

      const order = await Order.findByPk(orderId);
      if (order) {
        const statusField = `${department.toLowerCase()}_status`;
        await order.update({ [statusField]: 'SUCCESS' });

        await timelineService.logPrintJob(order, department, true);
      }

      return { success: true, jobId: printResult.jobId };
    } catch (error) {
      logger.error(`Error processing print job for ${department}:`, error);

      const order = await Order.findByPk(orderId);
      if (order) {
        const statusField = `${department.toLowerCase()}_status`;
        await order.update({ [statusField]: 'FAILURE' });

        await timelineService.logPrintJob(order, department, false, error.message);
      }

      throw error;
    }
  }

  async addPrintJob(orderId, pdfPath, department, storeClientId) {
    try {
      const queue = this.getQueueForDepartment(department);
      
      const job = await queue.add(
        {
          orderId,
          pdfPath,
          department,
          storeClientId
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000
          },
          removeOnComplete: true,
          removeOnFail: false
        }
      );

      logger.info(`Print job ${job.id} added to ${department} queue for order ${orderId}`);
      return job;
    } catch (error) {
      logger.error(`Error adding print job to ${department} queue:`, error);
      throw error;
    }
  }

  async addPrintJobs(orderId, pdfPath, departments, storeClientId) {
    const jobs = [];

    for (const department of departments) {
      const job = await this.addPrintJob(orderId, pdfPath, department, storeClientId);
      jobs.push(job);
    }

    return jobs;
  }

  getQueueForDepartment(department) {
    switch (department.toUpperCase()) {
      case 'DM':
        return this.dmQueue;
      case 'CONFECTIONERY':
        return this.confectioneryQueue;
      case 'DESIGN':
        return this.designQueue;
      default:
        throw new Error(`Unknown department: ${department}`);
    }
  }

  async getQueueStats(department) {
    const queue = this.getQueueForDepartment(department);
    
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ]);

    return {
      department,
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };
  }

  async getAllQueueStats() {
    const [dmStats, confectioneryStats, designStats] = await Promise.all([
      this.getQueueStats('DM'),
      this.getQueueStats('CONFECTIONERY'),
      this.getQueueStats('DESIGN')
    ]);

    return {
      dm: dmStats,
      confectionery: confectioneryStats,
      design: designStats
    };
  }
}

module.exports = new PrintQueueService();