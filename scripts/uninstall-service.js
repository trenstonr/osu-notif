const fs = require('fs');
const { execSync } = require('child_process');

const SERVICE_NAME = 'osu-class-monitor';

console.log('Uninstalling OSU Class Monitor service...');

// Check if running as root
if (process.getuid() !== 0) {
  console.error('Error: This script must be run as root (sudo)');
  console.error('Usage: sudo node scripts/uninstall-service.js');
  process.exit(1);
}

try {
  // Stop the service
  try {
    execSync(`systemctl stop ${SERVICE_NAME}`, { stdio: 'inherit' });
    console.log(`✓ Stopped ${SERVICE_NAME} service`);
  } catch (error) {
    console.log(`Service ${SERVICE_NAME} was not running`);
  }
  
  // Disable the service
  try {
    execSync(`systemctl disable ${SERVICE_NAME}`, { stdio: 'inherit' });
    console.log(`✓ Disabled ${SERVICE_NAME} service`);
  } catch (error) {
    console.log(`Service ${SERVICE_NAME} was not enabled`);
  }
  
  // Remove the service file
  const serviceFilePath = `/etc/systemd/system/${SERVICE_NAME}.service`;
  if (fs.existsSync(serviceFilePath)) {
    fs.unlinkSync(serviceFilePath);
    console.log(`✓ Removed service file: ${serviceFilePath}`);
  } else {
    console.log(`Service file ${serviceFilePath} does not exist`);
  }
  
  // Reload systemd
  execSync('systemctl daemon-reload', { stdio: 'inherit' });
  console.log('✓ Reloaded systemd');
  
  console.log('\n🎉 OSU Class Monitor service uninstalled successfully!');
  
} catch (error) {
  console.error('Error uninstalling service:', error.message);
  process.exit(1);
}