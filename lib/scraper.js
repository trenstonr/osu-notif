require('dotenv').config();
const axios = require('axios');

/**
 * Scrapes the OSU class status for a given class using the correct OSU API
 * @param {Object} classInfo - Object containing crn, term, subject, courseNumber
 * @returns {Promise<Object>} - Result object with success, status, and error properties
 */
async function scrapeClassStatus(classInfo) {
  try {
    // Use the correct OSU course API endpoint
    const baseUrl = 'https://mydegrees.oregonstate.edu/dashboard/api/course-link';
    
    // Construct the API URL with query parameters (as shown in working example)
    const url = `${baseUrl}?discipline=${classInfo.subject}&number=${classInfo.courseNumber}&`;
    
    // Headers as shown in the working Scala example
    const headers = {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'Referer': 'https://mydegrees.oregonstate.edu/dashboard/plans/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    // Cookies for authentication (as shown in working example)
    const refreshToken = process.env.REFRESH_TOKEN || '';
    const authToken = process.env.X_AUTH_TOKEN || '';
    
    // Keep tokens as-is (they include "Bearer+" prefix which is required)
    const response = await axios.get(url, {
      headers: {
        ...headers,
        'Cookie': `REFRESH_TOKEN=${refreshToken}; X-AUTH-TOKEN=${authToken}`
      },
      timeout: 30000 // 30 second read timeout
    });

    if (response.data) {
      // The API returns course metadata with sections containing enrollment data
      const courseInfo = response.data.courseInformation;
      
      if (courseInfo && courseInfo.courses && courseInfo.courses.length > 0) {
        // API found the course in Banner
        const course = courseInfo.courses[0];
        
        // The API returns sections with enrollment data
        // Each section is a different offering/time of the course with its own CRN
        let classData = null;
        if (course.sections && Array.isArray(course.sections)) {
          // Find the section matching our CRN
          const section = course.sections.find(s => s.courseReferenceNumber == classInfo.crn);
          if (section) {
            classData = {
              crn: section.courseReferenceNumber,
              status: parseInt(section.seatsAvailable) > 0 ? 'OPEN' : 'CLOSED',
              seatsAvailable: parseInt(section.seatsAvailable) || 0,
              enrolled: parseInt(section.enrollment) || 0,
              capacity: parseInt(section.maximumEnrollment) || 0,
              title: course.title || 'Unknown',
              subject: course.subjectCode || classInfo.subject,
              courseNumber: course.courseNumber || classInfo.courseNumber,
              section: section.sequenceNumber || '',
              term: section.termLiteral || classInfo.term
            };
          }
        }
        
        if (classData) {
          return {
            success: true,
            status: classData.status,
            seatsAvailable: classData.seatsAvailable,
            enrolled: classData.enrolled,
            capacity: classData.capacity,
            classData: classData
          };
        } else {
          // Course exists but couldn't find matching CRN in sections
          return {
            success: false,
            error: `Course found (${course.subjectCode} ${course.courseNumber}) but CRN ${classInfo.crn} not found in any section`
          };
        }
      } else if (courseInfo && courseInfo.error) {
        return {
          success: false,
          error: `API Error: ${courseInfo.error.message} (Status: ${courseInfo.error.status})`
        };
      } else {
        return {
          success: false,
          error: 'No course data found in API response'
        };
      }
    } else {
      return {
        success: false,
        error: 'No data returned from API'
      };
    }
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Request timeout - API may be slow or unavailable'
      };
    }
    
    if (error.response) {
      return {
        success: false,
        error: `API error: ${error.response.status} - ${error.response.statusText}`
      };
    }
    
    return {
      success: false,
      error: `Network error: ${error.message}`
    };
  }
}

/**
 * Alternative scraping method using the classes.oregonstate.edu API (fallback)
 * @param {Object} classInfo - Object containing crn, term, subject, courseNumber
 * @returns {Promise<Object>} - Result object with success, status, and error properties
 */
async function scrapeClassStatusFallback(classInfo) {
  try {
    // Fallback to the original classes.oregonstate.edu API
    const baseUrl = 'https://classes.oregonstate.edu/api/?page=fose&route=search';
    
    const searchData = {
      term: classInfo.term,
      subject: classInfo.subject,
      courseno: classInfo.courseNumber,
      crn: classInfo.crn
    };

    const response = await axios.post(baseUrl, searchData, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });

    if (response.data && response.data.results) {
      const classData = response.data.results.find(result => 
        result.crn === classInfo.crn && 
        result.subject === classInfo.subject &&
        result.courseno === classInfo.courseNumber
      );

      if (classData) {
        return {
          success: true,
          status: classData.status || 'UNKNOWN',
          seatsAvailable: parseInt(classData.seats) - parseInt(classData.enrolled),
          enrolled: parseInt(classData.enrolled),
          capacity: parseInt(classData.seats),
          classData: classData
        };
      } else {
        return {
          success: false,
          error: 'Class not found in results'
        };
      }
    } else {
      return {
        success: false,
        error: 'No results returned from API'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Fallback API failed: ${error.message}`
    };
  }
}

module.exports = {
  scrapeClassStatus,
  scrapeClassStatusFallback
};
