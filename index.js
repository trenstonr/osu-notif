const cron = require('node-cron');
const chalk = require('chalk').default;
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import modules
const { scrapeClassStatus } = require('./lib/scraper');
const { sendEmailNotification } = require('./lib/notifications');
const { parseClassesConfig, formatClassInfo } = require('./lib/utils');

// Configuration
const CHECK_INTERVAL = parseInt(process.env.CHECK_INTERVAL) || 5;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const ENABLE_CONSOLE_NOTIFICATIONS = process.env.ENABLE_CONSOLE_NOTIFICATIONS === 'true';
const ENABLE_EMAIL_NOTIFICATIONS = process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true';

// Parse classes to monitor
const CLASSES_TO_MONITOR = parseClassesConfig(process.env.CLASSES_TO_MONITOR || '');

// Logger setup
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: LOG_LEVEL,
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// State tracking
const classStatus = new Map();
let isFirstRun = true;

// Initialize logs directory
const fs = require('fs');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

console.log(chalk.blue('OSU Class Monitor Starting...'));
console.log(chalk.yellow(`Monitoring ${CLASSES_TO_MONITOR.length} classes`));
console.log(chalk.yellow(`Check interval: ${CHECK_INTERVAL} minutes`));
console.log(chalk.yellow(`Logging level: ${LOG_LEVEL}`));
console.log('');

// Schedule monitoring task
const schedule = `*/${CHECK_INTERVAL} * * * *`;
logger.info(`Scheduling checks every ${CHECK_INTERVAL} minutes: ${schedule}`);

cron.schedule(schedule, async () => {
  logger.info('Starting scheduled class status check...');
  
  for (const classInfo of CLASSES_TO_MONITOR) {
    try {
      const result = await scrapeClassStatus(classInfo);
      
      if (result.success) {
        const classKey = `${classInfo.term}-${classInfo.subject}-${classInfo.courseNumber}-${classInfo.crn}`;
        const previousStatus = classStatus.get(classKey);
        
        // Check if status changed or if it's the first run
        if (isFirstRun || previousStatus !== result.status) {
          classStatus.set(classKey, result.status);
          
          if (result.status === 'OPEN') {
            const message = `🎉 Class OPEN: ${formatClassInfo(classInfo)} - Seats available!`;
            logger.info(message);
            
            // Send notifications
            if (ENABLE_CONSOLE_NOTIFICATIONS) {
              console.log(chalk.green(message));
            }
            
            if (ENABLE_EMAIL_NOTIFICATIONS) {
              await sendEmailNotification(classInfo, result);
            }
          } else if (result.status === 'CLOSED') {
            const message = `❌ Class CLOSED: ${formatClassInfo(classInfo)}`;
            logger.info(message);
            
            if (ENABLE_CONSOLE_NOTIFICATIONS) {
              console.log(chalk.red(message));
            }
          }
        }
      } else {
        logger.error(`Failed to check class: ${formatClassInfo(classInfo)} - ${result.error}`);
      }
    } catch (error) {
      logger.error(`Error checking class ${formatClassInfo(classInfo)}: ${error.message}`);
    }
  }
  
  if (isFirstRun) {
    isFirstRun = false;
    logger.info('Initial scan completed. Monitoring will continue every ' + CHECK_INTERVAL + ' minutes.');
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run initial check immediately
(async () => {
  logger.info('Running initial class status check...');
  for (const classInfo of CLASSES_TO_MONITOR) {
    try {
      const result = await scrapeClassStatus(classInfo);
      if (result.success) {
        const classKey = `${classInfo.term}-${classInfo.subject}-${classInfo.courseNumber}-${classInfo.crn}`;
        classStatus.set(classKey, result.status);
        logger.info(`Initial check for ${formatClassInfo(classInfo)}: ${result.status}`);
      } else {
        logger.error(`Initial check failed for ${formatClassInfo(classInfo)}: ${result.error}`);
      }
    } catch (error) {
      logger.error(`Initial check error for ${formatClassInfo(classInfo)}: ${error.message}`);
    }
  }
  logger.info('Initial scan completed. Waiting for scheduled checks...');
})();