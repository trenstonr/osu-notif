/**
 * Parses the classes configuration string into an array of class objects
 * @param {string} configString - Configuration string in format "CRN|TERM|SUBJECT|COURSE_NUMBER,CRN2|TERM2|SUBJECT2|COURSE_NUMBER2"
 * @returns {Array<Object>} - Array of class objects
 */
function parseClassesConfig(configString) {
  if (!configString || configString.trim() === '') {
    console.error('No classes configured. Please set CLASSES_TO_MONITOR in your .env file.');
    console.error('Example: CLASSES_TO_MONITOR=12345|FALL2024|CS|161,67890|FALL2024|MATH|251');
    process.exit(1);
  }

  const classes = configString.split(',').map(classStr => {
    const [crn, term, subject, courseNumber] = classStr.split('|').map(s => s.trim());
    
    if (!crn || !term || !subject || !courseNumber) {
      throw new Error(`Invalid class configuration: ${classStr}. Expected format: CRN|TERM|SUBJECT|COURSE_NUMBER`);
    }

    return {
      crn: crn,
      term: term.toUpperCase(),
      subject: subject.toUpperCase(),
      courseNumber: courseNumber
    };
  });

  return classes;
}

/**
 * Formats class information for display
 * @param {Object} classInfo - Object containing crn, term, subject, courseNumber
 * @returns {string} - Formatted class information string
 */
function formatClassInfo(classInfo) {
  return `${classInfo.subject} ${classInfo.courseNumber} (CRN: ${classInfo.crn}, Term: ${classInfo.term})`;
}

/**
 * Validates class information
 * @param {Object} classInfo - Object containing class information
 * @returns {Object} - Validation result with success and errors
 */
function validateClassInfo(classInfo) {
  const errors = [];
  
  if (!classInfo.crn || !/^\d{5}$/.test(classInfo.crn)) {
    errors.push('CRN must be a 5-digit number');
  }
  
  if (!classInfo.term) {
    errors.push('Term is required');
  }
  
  if (!classInfo.subject || classInfo.subject.length < 2) {
    errors.push('Subject must be at least 2 characters');
  }
  
  if (!classInfo.courseNumber) {
    errors.push('Course number is required');
  }
  
  return {
    success: errors.length === 0,
    errors: errors
  };
}

/**
 * Formats a date for logging
 * @returns {string} - Formatted date string
 */
function getFormattedDate() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Delays execution for a specified number of milliseconds
 * @param {number} ms - Number of milliseconds to delay
 * @returns {Promise} - Promise that resolves after the delay
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  parseClassesConfig,
  formatClassInfo,
  validateClassInfo,
  getFormattedDate,
  delay
};