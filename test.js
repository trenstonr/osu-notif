require('dotenv').config();
const { scrapeClassStatus } = require('./lib/scraper');
const { sendEmailNotification } = require('./lib/notifications');

/**
 * Universal test script for checking class availability
 * 
 * Usage:
 *   node test.js CRN TERM SUBJECT COURSENUMBER [CRN TERM SUBJECT COURSENUMBER ...]
 * 
 * Examples:
 *   node test.js 53012 SPRING2026 MTH 231
 *   node test.js 53012 SPRING2026 MTH 231 53648 SPRING2026 CS 162
 *   node test.js 60217 SPRING2026 ECE 204
 */

async function testClass(crn, term, subject, courseNumber) {
  console.log(`\n=== Testing ${subject} ${courseNumber} (CRN ${crn}) ${term} ===`);
  
  try {
    const classInfo = {
      crn: crn.toString(),
      term: term,
      subject: subject,
      courseNumber: courseNumber
    };

    const result = await scrapeClassStatus(classInfo);

    if (result.success) {
      console.log(`✅ Success`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Seats Available: ${result.seatsAvailable}/${result.capacity}`);
      console.log(`   Enrolled: ${result.enrolled}`);
      if (result.classData.term) console.log(`   Term: ${result.classData.term}`);
      if (result.classData.section) console.log(`   Section: ${result.classData.section}`);

      // If class is open, test email notification
      if (result.status === 'OPEN' || result.seatsAvailable > 0) {
        console.log(`\n   📧 Sending test email...`);
        const emailResult = await sendEmailNotification(classInfo, result);
        if (emailResult.success) {
          console.log(`   ✅ Email sent! (${emailResult.messageId})`);
        } else {
          console.log(`   ❌ Email failed: ${emailResult.error}`);
        }
      }
    } else {
      console.log(`❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 4 || args.length % 4 !== 0) {
    console.log('Usage: node test.js CRN TERM SUBJECT COURSENUMBER [CRN TERM SUBJECT COURSENUMBER ...]');
    console.log('\nExamples:');
    console.log('  node test.js 53012 SPRING2026 MTH 231');
    console.log('  node test.js 53012 SPRING2026 MTH 231 53648 SPRING2026 CS 162');
    console.log('  node test.js 60217 SPRING2026 ECE 204');
    process.exit(1);
  }

  console.log('Testing Course Availability...');
  
  for (let i = 0; i < args.length; i += 4) {
    const crn = args[i];
    const term = args[i + 1];
    const subject = args[i + 2];
    const courseNumber = args[i + 3];
    
    await testClass(crn, term, subject, courseNumber);
  }
  
  console.log('\n=== Tests Complete ===\n');
}

main();
