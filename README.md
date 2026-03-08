# OSU Class Monitor

A 24/7 monitoring application for Oregon State University class availability using CRN numbers. This application continuously checks the OSU classes website for specific classes and alerts you when openings become available.

## Features

- **24/7 Monitoring**: Runs continuously to monitor class availability
- **Multiple Notification Methods**: Desktop notifications, console output, and email alerts
- **Configurable**: Easy configuration for multiple classes and terms
- **Raspberry Pi Compatible**: Lightweight and efficient for running on Raspberry Pi 5
- **Systemd Service**: Can be installed as a system service for automatic startup
- **Comprehensive Logging**: Detailed logs for monitoring and debugging

## Requirements

- Node.js (version 14 or higher)
- npm
- Raspberry Pi 5 (recommended) or any Linux system

## Installation

1. **Clone or download this project**
   ```bash
   git clone <repository-url>
   cd osu-class-monitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your classes**
   - Copy `.env.example` to `.env`
   - Edit `.env` with your configuration

## Configuration

Edit the `.env` file to configure the application:

```bash
# Monitoring Configuration
CHECK_INTERVAL=5  # Check every 5 minutes
LOG_LEVEL=info    # Log level: error, warn, info, verbose, debug

# Notification Settings
ENABLE_DESKTOP_NOTIFICATIONS=true
ENABLE_CONSOLE_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=false

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=your-email@gmail.com

# Classes to Monitor
# Format: CRN|TERM|SUBJECT|COURSE_NUMBER
CLASSES_TO_MONITOR=12345|FALL2024|CS|161,67890|FALL2024|MATH|251
```

### Class Configuration Format

Classes are configured using the format: `CRN|TERM|SUBJECT|COURSE_NUMBER`

**Example:**
- `12345|FALL2024|CS|161` - CRN 12345, Fall 2024 term, Computer Science 161
- `67890|FALL2024|MATH|251` - CRN 67890, Fall 2024 term, Mathematics 251

**Finding CRN Numbers:**
1. Go to [https://classes.oregonstate.edu/](https://classes.oregonstate.edu/)
2. Search for your desired class
3. The CRN number is displayed in the search results

## Usage

### Running Manually

```bash
# Start the monitor
npm start

# Run in development mode with auto-restart
npm run dev
```

### Installing as a System Service (Recommended for 24/7 Operation)

Install the service to run automatically on boot:

```bash
# Install the service (requires sudo)
sudo npm run install-service

# Check service status
sudo systemctl status osu-class-monitor

# View logs
sudo journalctl -u osu-class-monitor -f
```

### Service Management Commands

```bash
# Start the service
sudo systemctl start osu-class-monitor

# Stop the service
sudo systemctl stop osu-class-monitor

# Restart the service
sudo systemctl restart osu-class-monitor

# View service logs
sudo journalctl -u osu-class-monitor -f

# Uninstall the service
sudo npm run uninstall-service
```

## Email Notifications Setup

To enable email notifications:

1. **Gmail Setup (Recommended):**
   - Enable 2-Factor Authentication on your Google account
   - Generate an App Password: Google Account → Security → App passwords
   - Use your email and the app password in the `.env` configuration

2. **Other Email Providers:**
   - Update the email configuration in `.env` with your provider's SMTP settings

## Monitoring Output

The application provides real-time feedback:

- **Console Output**: Color-coded status updates
- **Desktop Notifications**: Pop-up alerts when classes open
- **Email Alerts**: Detailed notifications sent to your email
- **Log Files**: Comprehensive logs in the `logs/` directory

## Troubleshooting

### Common Issues

1. **"No classes configured" Error**
   - Ensure `CLASSES_TO_MONITOR` is set in your `.env` file
   - Verify the format: `CRN|TERM|SUBJECT|COURSE_NUMBER`

2. **Email Notifications Not Working**
   - Check your email credentials in `.env`
   - For Gmail, ensure you're using an App Password, not your regular password
   - Verify `ENABLE_EMAIL_NOTIFICATIONS=true`

3. **Service Won't Start**
   - Check that Node.js is installed: `node --version`
   - Verify the project directory path in the service file
   - Check logs: `sudo journalctl -u osu-class-monitor -f`

### Log Files

- **Combined logs**: `logs/combined.log`
- **Error logs**: `logs/error.log`
- **System logs**: `sudo journalctl -u osu-class-monitor -f`

## Performance and Resource Usage

This application is optimized for Raspberry Pi 5:

- **Low Memory Usage**: ~10-20MB RAM
- **Minimal CPU Usage**: Checks every 5 minutes by default
- **Network Efficient**: Only makes API calls during checks
- **Storage Light**: Log rotation prevents disk space issues

## Security Notes

- Store email credentials securely in `.env`
- Use app passwords for Gmail instead of regular passwords
- The application only makes HTTPS requests to osu.edu
- No sensitive data is logged or stored

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the log files for error details
3. Ensure your configuration is correct
4. Verify network connectivity to osu.edu

## Disclaimer

This application is not affiliated with Oregon State University. It is provided as-is for educational and personal use. The authors are not responsible for any issues related to class registration or scheduling.