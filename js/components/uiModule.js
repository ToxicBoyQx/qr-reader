/**
 * UI Module
 * Handles user interface interactions and display of scan results
 */

class UIModule {
    constructor() {
        this.elements = {};
        this.callbacks = {};
    }

    /**
     * Initialize the UI module with DOM elements
     * @param {Object} elements - Object containing DOM elements
     */
    initialize(elements) {
        this.elements = elements;
        this._setupEventListeners();
    }

    /**
     * Set up event listeners for UI elements
     * @private
     */
    _setupEventListeners() {
        // Start button
        if (this.elements.startButton) {
            this.elements.startButton.addEventListener('click', () => {
                if (this.callbacks.onStartScan) {
                    this.callbacks.onStartScan();
                }
            });
        }

        // Stop button
        if (this.elements.stopButton) {
            this.elements.stopButton.addEventListener('click', () => {
                if (this.callbacks.onStopScan) {
                    this.callbacks.onStopScan();
                }
            });
        }

        // Upload button
        if (this.elements.uploadButton && this.elements.fileInput) {
            this.elements.uploadButton.addEventListener('click', () => {
                this.elements.fileInput.click();
            });

            this.elements.fileInput.addEventListener('change', (event) => {
                if (this.callbacks.onFileUpload) {
                    this.callbacks.onFileUpload(event);
                }
            });
        }
    }

    /**
     * Register callback functions
     * @param {Object} callbacks - Object containing callback functions
     */
    registerCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Update the camera button states
     * @param {boolean} isScanning - Whether scanning is active
     */
    updateCameraButtons(isScanning) {
        if (this.elements.startButton) {
            this.elements.startButton.disabled = isScanning;
        }
        if (this.elements.stopButton) {
            this.elements.stopButton.disabled = !isScanning;
        }
    }

    /**
     * Display an error message
     * @param {string} message - The error message to display
     */
    showError(message) {
        if (this.elements.errorMessage) {
            this.elements.errorMessage.textContent = message;
        }
    }

    /**
     * Clear the error message
     */
    clearError() {
        if (this.elements.errorMessage) {
            this.elements.errorMessage.textContent = '';
        }
    }

    /**
     * Display scan result
     * @param {Object} result - The scan result object
     */
    displayResult(result) {
        if (this.elements.resultDiv) {
            this.elements.resultDiv.textContent = result.raw || 'No QR code detected';
        }
    }

    /**
     * Update the scan history display
     * @param {Array} history - Array of scan history items
     */
    updateHistoryDisplay(history) {
        if (!this.elements.historyContainer) return;

        this.elements.historyContainer.innerHTML = '';
        
        // Display up to 10 most recent scans
        const recentScans = history.slice(0, 10);
        
        recentScans.forEach(scan => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // Format the timestamp
            const timestamp = new Date(scan.timestamp).toLocaleString();
            
            // Create content based on whether it's a URL
            let content = '';
            if (scan.isURL) {
                content = `<a href="${scan.raw}" target="_blank">${scan.raw}</a>`;
            } else {
                content = scan.raw;
            }
            
            historyItem.innerHTML = `
                <div><strong>${timestamp}</strong></div>
                <div>${content}</div>
            `;
            
            this.elements.historyContainer.appendChild(historyItem);
        });
    }

    /**
     * Check if the browser supports required APIs
     * @returns {boolean} - True if all required APIs are supported
     */
    checkBrowserSupport() {
        let hasMediaSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        let hasFileSupport = !!(window.File && window.FileReader && window.FileList && window.Blob);
        
        if (!hasMediaSupport) {
            this.showError('Your browser does not support camera access. You can still upload QR code images.');
            if (this.elements.startButton) {
                this.elements.startButton.disabled = true;
            }
        }
        
        if (!hasFileSupport) {
            this.showError((this.elements.errorMessage.textContent ? this.elements.errorMessage.textContent + ' ' : '') + 
                'Your browser does not fully support the File API needed for image uploads.');
            if (this.elements.uploadButton) {
                this.elements.uploadButton.disabled = true;
            }
        }
        
        return hasMediaSupport && hasFileSupport;
    }
}

export default UIModule;