/**
 * Main Application
 * Integrates all modules and handles the application flow
 */

import qrService from './api/qrService.js';
import CameraModule from './components/cameraModule.js';
import UIModule from './components/uiModule.js';

class QRReaderApp {
    constructor() {
        // Initialize modules
        this.qrService = qrService;
        this.cameraModule = new CameraModule();
        this.uiModule = new UIModule();
        
        // Application state
        this.isScanning = false;
        this.lastScanData = null;
    }

    /**
     * Initialize the application
     */
    initialize() {
        // Get DOM elements
        const elements = {
            video: document.getElementById('qr-video'),
            canvas: document.getElementById('qr-canvas'),
            resultDiv: document.getElementById('result'),
            errorMessage: document.getElementById('error-message'),
            historyContainer: document.getElementById('history-container'),
            startButton: document.getElementById('start-button'),
            stopButton: document.getElementById('stop-button'),
            uploadButton: document.getElementById('upload-button'),
            fileInput: document.getElementById('file-input')
        };

        // Initialize modules with DOM elements
        this.cameraModule.initialize(
            elements.video, 
            elements.canvas, 
            (error) => this.uiModule.showError(error)
        );

        this.uiModule.initialize(elements);

        // Register UI callbacks
        this.uiModule.registerCallbacks({
            onStartScan: () => this.startScanning(),
            onStopScan: () => this.stopScanning(),
            onFileUpload: (event) => this.handleFileUpload(event)
        });

        // Check browser support
        this.uiModule.checkBrowserSupport();

        // Load and display scan history
        this.loadScanHistory();
    }

    /**
     * Start the scanning process
     */
    async startScanning() {
        this.uiModule.clearError();
        
        const success = await this.cameraModule.startCamera((imageData) => {
            this.processFrame(imageData);
        });

        if (success) {
            this.isScanning = true;
            this.uiModule.updateCameraButtons(this.isScanning);
        }
    }

    /**
     * Stop the scanning process
     */
    stopScanning() {
        this.cameraModule.stopCamera();
        this.isScanning = false;
        this.uiModule.updateCameraButtons(this.isScanning);
    }

    /**
     * Process a video frame or image
     * @param {ImageData} imageData - The image data to process
     */
    async processFrame(imageData) {
        // Detect QR code
        const code = this.qrService.detectQRCode(imageData);
        
        // If QR code is detected
        if (code) {
            // Check if this is a new scan (not the same as the last one)
            if (!this.lastScanData || this.lastScanData !== code.data) {
                this.lastScanData = code.data;
                
                try {
                    // Process the QR data (could make API calls here)
                    const processedData = await this.qrService.processQRData(code.data);
                    
                    // Display result
                    this.uiModule.displayResult(processedData);
                    
                    // Save to history
                    this.qrService.saveScan(processedData);
                    
                    // Update history display
                    this.loadScanHistory();
                } catch (error) {
                    console.error('Error processing QR data:', error);
                    this.uiModule.showError(`Error processing QR data: ${error.message}`);
                }
            }
        }
    }

    /**
     * Handle file upload for QR code scanning
     * @param {Event} event - The file input change event
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.uiModule.clearError();
        
        try {
            // Process the uploaded image
            const imageData = await this.cameraModule.processImageFile(file);
            
            // Process the image data
            await this.processFrame(imageData);
            
            // Clear the file input
            event.target.value = '';
        } catch (error) {
            this.uiModule.showError(error.message);
            console.error('Error processing file:', error);
        }
    }

    /**
     * Load and display scan history
     */
    loadScanHistory() {
        const history = this.qrService.getScanHistory();
        this.uiModule.updateHistoryDisplay(history);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new QRReaderApp();
    app.initialize();
});