# OSU Class Monitor

Monitor Oregon State University class availability and get instant notifications when seats open up.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure your classes**
   - Copy `.env.example` to `.env`
   - Add your OSU authentication tokens (see below)
   - Add classes to monitor in format: `CRN|TERM|SUBJECT|COURSENUMBER`
   - Example: `CLASSES_TO_MONITOR=53012|SPRING2026|MTH|231`

3. **Get OSU API tokens**
   - Log into https://mydegrees.oregonstate.edu/dashboard/
   - Open DevTools (F12) → Network tab → Refresh
   - Find any API request and copy `REFRESH_TOKEN` and `X-AUTH-TOKEN` from Cookies
   - Add them to `.env`

4. **Test a class**
   ```bash
   node test.js 53012 SPRING2026 MTH 231
   ```

5. **Start monitoring**
   ```bash
   npm start
   ```

## Configuration (.env)

```bash
# Check interval (in minutes)
CHECK_INTERVAL=5

# Enable notifications
ENABLE_DESKTOP_NOTIFICATIONS=true
ENABLE_CONSOLE_NOTIFICATIONS=true
ENABLE_EMAIL_NOTIFICATIONS=false

# Email (Gmail: use App Password if 2FA enabled)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=your-email@gmail.com

# Classes to monitor (comma-separated)
CLASSES_TO_MONITOR=53012|SPRING2026|MTH|231,53648|SPRING2026|CS|162

# OSU API tokens
REFRESH_TOKEN=your-token-here
X_AUTH_TOKEN=your-token-here
```

## Testing

```bash
# Test single class
node test.js 53012 SPRING2026 MTH 231

# Test multiple classes
node test.js 53012 SPRING2026 MTH 231 60217 SPRING2026 ECE 204
```

## Service (Linux/Raspberry Pi)

```bash
# Install as system service
sudo npm run install-service

# Check status
sudo systemctl status osu-class-monitor

# View logs
sudo journalctl -u osu-class-monitor -f

# Uninstall
sudo npm run uninstall-service
```
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