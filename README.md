# Offline QR Code Reader

A lightweight, browser-based QR code reader that works completely offline. This application leverages your device's camera to instantly scan and decode QR codes with no internet connection required.

## Features

- 100% offline functionality after initial load
- Real-time QR code scanning with instant results
- Persistent scan history storing last 10 scans locally
- Smart URL detection with auto-generated clickable links
- Responsive design optimized for both desktop and mobile
- Zero server dependencies
- Privacy-focused with all processing done locally

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ToxicBoyQx/qr-reader.git
   ```
2. Navigate to the project directory:
   ```bash
   cd offline-qr-reader
   ```
3. No additional installation required - just serve the files using any web server

### Quick Setup Options:

- **Using Python (Python 3+)**:
  ```bash
  python -m http.server 8000
  ```
  Then visit `http://localhost:8000`

- **Using Node.js**:
  ```bash
  npx http-server
  ```
  Then visit `http://localhost:8080`

- **Using PHP**:
  ```bash
  php -S localhost:8000
  ```
  Then visit `http://localhost:8000`

## Detailed Usage Guide

1. **Initial Setup**:
   - Open `index.html` in a modern web browser
   - Grant camera permissions when prompted
   - For best results, ensure adequate lighting

2. **Starting a Scan Session**:
   - Click "Start Camera" to activate video feed
   - Camera feed will appear in the viewport
   - Hold QR code steady within the scanning area

3. **Scanning Process**:
   - Position QR code 6-12 inches from camera
   - Keep device stable while scanning
   - Successful scans trigger visual feedback
   - Results appear instantly in "Scan Result" section

4. **Managing Scan Results**:
   - Recent scans appear in "Scan History"
   - Click on detected URLs to open them
   - History persists across browser sessions
   - Clear history using "Clear History" button

5. **Finishing Up**:
   - Click "Stop Camera" to end session
   - Camera access is automatically revoked
   - Scan history remains accessible

## Technical Requirements

- Device with functioning camera (built-in or external)
- Modern web browser supporting:
  - MediaDevices API
  - Canvas API
  - LocalStorage
  - ES6+ JavaScript
- Recommended browsers:
  - Chrome 60+
  - Firefox 55+
  - Safari 11+
  - Edge 79+

## Technical Architecture

This application leverages several modern web technologies:
- HTML5 Camera API (MediaDevices) for real-time video capture
- Canvas API for frame-by-frame video processing
- jsQR library (version 1.4.0+) for QR detection algorithms
- LocalStorage for persistent scan history
- CSS Grid/Flexbox for responsive layouts

## Privacy & Security

Your privacy is our priority:
- All processing occurs locally in your browser
- No data transmission to external servers
- No cookies or tracking mechanisms
- Camera access only during active scanning
- Scan history stored only on your device
- Open-source code for full transparency
