const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const SERVICE_NAME = 'osu-class-monitor';
const PROJECT_DIR = __dirname + '/..';
const USER = os.userInfo().username;

// Find node path
let nodePath = '/usr/bin/node';
try {
  nodePath = execSync('which node', { encoding: 'utf-8' }).trim();
} catch (e) {
  // Use default if which fails
}

// Create systemd service file content
const serviceContent = `[Unit]
Description=OSU Class Monitor Service
After=network.target

[Service]
Type=simple
User=${USER}
WorkingDirectory=${PROJECT_DIR}
ExecStart=${nodePath} index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;

// Create the service file
const serviceFilePath = `/etc/systemd/system/${SERVICE_NAME}.service`;

console.log('Installing OSU Class Monitor as a systemd service...');
console.log(`Service will run as user: ${USER}`);
console.log(`Project directory: ${PROJECT_DIR}`);

// Check if running as root
if (process.getuid() !== 0) {
  console.error('Error: This script must be run as root (sudo)');
  console.error('Usage: sudo node scripts/install-service.js');
  process.exit(1);
}

try {
  // Write service file
  fs.writeFileSync(serviceFilePath, serviceContent);
  console.log(`✓ Created service file: ${serviceFilePath}`);
  
  // Reload systemd
  execSync('systemctl daemon-reload', { stdio: 'inherit' });
  console.log('✓ Reloaded systemd');
  
  // Enable the service
  execSync(`systemctl enable ${SERVICE_NAME}`, { stdio: 'inherit' });
  console.log(`✓ Enabled ${SERVICE_NAME} service`);
  
  // Start the service
  execSync(`systemctl start ${SERVICE_NAME}`, { stdio: 'inherit' });
  console.log(`✓ Started ${SERVICE_NAME} service`);
  
  // Check status
  console.log('\nService status:');
  execSync(`systemctl status ${SERVICE_NAME}`, { stdio: 'inherit' });
  
  console.log('\n🎉 OSU Class Monitor service installed successfully!');
  console.log('\nUseful commands:');
  console.log(`  sudo systemctl status ${SERVICE_NAME}    # Check service status`);
  console.log(`  sudo systemctl stop ${SERVICE_NAME}     # Stop the service`);
  console.log(`  sudo systemctl start ${SERVICE_NAME}    # Start the service`);
  console.log(`  sudo systemctl restart ${SERVICE_NAME}  # Restart the service`);
  console.log(`  sudo journalctl -u ${SERVICE_NAME} -f   # View logs`);
  
} catch (error) {
  console.error('Error installing service:', error.message);
  process.exit(1);
}