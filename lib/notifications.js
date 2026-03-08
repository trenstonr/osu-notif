const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Sends an email notification when a class becomes available
 * @param {Object} classInfo - Object containing class information
 * @param {Object} result - Scraping result with class status
 * @returns {Promise<Object>} - Result of email sending operation
 */
async function sendEmailNotification(classInfo, result) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const subject = `🎉 OSU Class Available: ${classInfo.subject} ${classInfo.courseNumber}`;
    const message = `
      Good news! A seat has become available in your monitored class.
      
      Class Information:
      - Subject: ${classInfo.subject}
      - Course Number: ${classInfo.courseNumber}
      - CRN: ${classInfo.crn}
      - Term: ${classInfo.term}
      
      Current Status:
      - Status: ${result.status}
      ${result.seatsAvailable ? `- Seats Available: ${result.seatsAvailable}` : ''}
      ${result.enrolled ? `- Enrolled: ${result.enrolled}` : ''}
      ${result.capacity ? `- Capacity: ${result.capacity}` : ''}
      
      Please register as soon as possible as seats can fill up quickly!
      
      This is an automated message from your OSU Class Monitor.
    `;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: subject,
      text: message
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'Email notification sent successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: `Email notification failed: ${error.message}`
    };
  }
}

/**
 * Sends a desktop notification (already handled in main index.js)
 * This function is kept for potential future enhancements
 * @param {Object} classInfo - Object containing class information
 * @param {Object} result - Scraping result with class status
 */
function sendDesktopNotification(classInfo, result) {
  // Desktop notifications are handled directly in index.js using node-notifier
  // This function can be extended for more sophisticated notification handling
}

module.exports = {
  sendEmailNotification,
  sendDesktopNotification
};