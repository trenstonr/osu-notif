const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrapes the OSU class status for a given class
 * @param {Object} classInfo - Object containing crn, term, subject, courseNumber
 * @returns {Promise<Object>} - Result object with success, status, and error properties
 */
async function scrapeClassStatus(classInfo) {
  try {
    // Construct the URL for the OSU classes search
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
        'User-Agent': 'OSU-Class-Monitor/1.0'
      },
      timeout: 10000
    });

    if (response.data && response.data.results) {
      const classData = response.data.results.find(result => 
        result.crn === classInfo.crn && 
        result.subject === classInfo.subject &&
        result.courseno === classInfo.courseNumber
      );

      if (classData) {
        const status = classData.status;
        const seatsAvailable = parseInt(classData.seats) - parseInt(classData.enrolled);
        
        return {
          success: true,
          status: status === 'OPEN' ? 'OPEN' : 'CLOSED',
          seatsAvailable: seatsAvailable,
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
 * Alternative scraping method using direct HTML parsing (fallback)
 * @param {Object} classInfo - Object containing crn, term, subject, courseNumber
 * @returns {Promise<Object>} - Result object with success, status, and error properties
 */
async function scrapeClassStatusHTML(classInfo) {
  try {
    // Construct search URL
    const searchUrl = `https://classes.oregonstate.edu/?term=${classInfo.term}&subject=${classInfo.subject}&courseno=${classInfo.courseNumber}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    // Look for the specific CRN in the results
    let classStatus = 'CLOSED';
    let foundClass = false;
    
    // This is a simplified selector - the actual HTML structure may vary
    $('tr').each((index, element) => {
      const crnCell = $(element).find('td.crn').text().trim();
      if (crnCell === classInfo.crn) {
        foundClass = true;
        const statusCell = $(element).find('td.status').text().trim();
        classStatus = statusCell.toUpperCase() === 'OPEN' ? 'OPEN' : 'CLOSED';
        return false; // Break the loop
      }
    });

    if (foundClass) {
      return {
        success: true,
        status: classStatus
      };
    } else {
      return {
        success: false,
        error: 'Class not found in HTML results'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `HTML scraping failed: ${error.message}`
    };
  }
}

module.exports = {
  scrapeClassStatus,
  scrapeClassStatusHTML
};