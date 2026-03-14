const fs = require('fs');
const path = require('path');
const os = require('os');

class Logger {
  constructor() {
    this.logDir = path.join(os.homedir(), '.oma-electron', 'logs');
    this.logFile = path.join(this.logDir, `app-${this.getDateString()}.log`);
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory

    // Create log directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    this.info('Logger initialized');
  }

  getDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    let formatted = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      if (data instanceof Error) {
        formatted += `\n  Error: ${data.message}\n  Stack: ${data.stack}`;
      } else if (typeof data === 'object') {
        formatted += `\n  Data: ${JSON.stringify(data, null, 2)}`;
      } else {
        formatted += `\n  Data: ${data}`;
      }
    }

    return formatted;
  }

  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  addToMemory(level, message, data) {
    const logEntry = {
      timestamp: this.getTimestamp(),
      level: level,
      message: message,
      data: data
    };

    this.logs.push(logEntry);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  log(level, message, data = null) {
    const formatted = this.formatMessage(level, message, data);
    
    // Write to console
    console.log(formatted);

    // Write to file
    this.writeToFile(formatted);

    // Add to memory
    this.addToMemory(level, message, data);
  }

  info(message, data = null) {
    this.log('INFO', message, data);
  }

  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  error(message, data = null) {
    this.log('ERROR', message, data);
  }

  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }

  getLogs(limit = 100) {
    return this.logs.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
    this.info('Logs cleared');
  }

  getLogFilePath() {
    return this.logFile;
  }
}

// Export singleton instance
module.exports = new Logger();

