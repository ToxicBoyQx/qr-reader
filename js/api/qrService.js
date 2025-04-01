/**
 * QR Code Service API
 * Handles QR code scanning and processing functionality
 */

class QRService {
    constructor() {
        this.jsQR = window.jsQR;
        if (!this.jsQR) {
            throw new Error('jsQR library not found. Make sure jsQR.min.js is loaded.');
        }
    }

    /**
     * Process image data to detect QR code
     * @param {ImageData} imageData - The image data to process
     * @returns {Object|null} - QR code data or null if not found
     */
    detectQRCode(imageData) {
        try {
            return this.jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
        } catch (error) {
            console.error('Error detecting QR code:', error);
            return null;
        }
    }

    /**
     * Check if a string is a valid URL
     * @param {string} str - String to check
     * @returns {boolean} - True if string is a valid URL
     */
    isURL(str) {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Process QR code data (can be extended for API calls)
     * @param {string} data - QR code data
     * @returns {Promise<Object>} - Processed data
     */
    async processQRData(data) {
        // This is where you could make API calls to process the QR code data
        // For now, we'll just return the data with some metadata
        return {
            raw: data,
            isURL: this.isURL(data),
            timestamp: new Date().toISOString(),
            processed: true
        };
    }

    /**
     * Save scan to local storage (simulating a database)
     * @param {Object} scanData - The scan data to save
     */
    saveScan(scanData) {
        try {
            const history = this.getScanHistory();
            // Add new scan at the beginning
            history.unshift(scanData);
            // Keep only the last 50 scans
            const trimmedHistory = history.slice(0, 50);
            localStorage.setItem('qr-scan-history', JSON.stringify(trimmedHistory));
            return true;
        } catch (error) {
            console.error('Error saving scan:', error);
            return false;
        }
    }

    /**
     * Get scan history from local storage
     * @returns {Array} - Array of scan history items
     */
    getScanHistory() {
        try {
            const history = localStorage.getItem('qr-scan-history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error getting scan history:', error);
            return [];
        }
    }

    /**
     * Clear scan history
     * @returns {boolean} - Success status
     */
    clearScanHistory() {
        try {
            localStorage.removeItem('qr-scan-history');
            return true;
        } catch (error) {
            console.error('Error clearing scan history:', error);
            return false;
        }
    }
}

// Export as a singleton
const qrService = new QRService();
export default qrService;