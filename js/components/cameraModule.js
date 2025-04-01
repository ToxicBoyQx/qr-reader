/**
 * Camera Module
 * Handles camera access and video streaming functionality
 */

class CameraModule {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.stream = null;
        this.scanning = false;
        this.onFrameCallback = null;
        this.errorCallback = null;
    }

    /**
     * Initialize the camera module
     * @param {HTMLVideoElement} videoElement - The video element to use
     * @param {HTMLCanvasElement} canvasElement - The canvas element to use
     * @param {Function} errorCallback - Callback for error handling
     */
    initialize(videoElement, canvasElement, errorCallback) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.errorCallback = errorCallback;
    }

    /**
     * Check if the browser supports camera access
     * @returns {boolean} - True if camera is supported
     */
    isCameraSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    /**
     * Start the camera and begin scanning
     * @param {Function} onFrameCallback - Callback for each video frame
     * @returns {Promise<boolean>} - Success status
     */
    async startCamera(onFrameCallback) {
        if (!this.video || !this.canvas) {
            throw new Error('Camera module not initialized. Call initialize() first.');
        }

        this.onFrameCallback = onFrameCallback;

        try {
            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            
            // Set video source and start playing
            this.video.srcObject = this.stream;
            this.video.setAttribute('playsinline', true); // required for iOS Safari
            await this.video.play();
            
            // Set canvas size to match video dimensions
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            this.scanning = true;
            this._scanFrame();
            
            return true;
        } catch (error) {
            if (this.errorCallback) {
                this.errorCallback(`Camera error: ${error.message}`);
            }
            console.error('Error accessing camera:', error);
            return false;
        }
    }

    /**
     * Stop the camera and scanning
     */
    stopCamera() {
        this.scanning = false;
        
        if (this.stream) {
            // Stop all tracks in the stream
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            
            // Clear video source
            if (this.video) {
                this.video.srcObject = null;
            }
        }
    }

    /**
     * Process the current video frame
     * @private
     */
    _scanFrame() {
        if (!this.scanning) return;
        
        // Check if video is playing
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            // Draw current video frame to canvas
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Get image data for processing
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Call the frame callback with the image data
            if (this.onFrameCallback) {
                this.onFrameCallback(imageData);
            }
        }
        
        // Continue scanning
        requestAnimationFrame(() => this._scanFrame());
    }

    /**
     * Process an uploaded image file
     * @param {File} file - The image file to process
     * @returns {Promise<ImageData|null>} - The image data or null if error
     */
    processImageFile(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.match('image.*')) {
                reject(new Error('Invalid file type. Please select an image file.'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    // Set canvas dimensions to match image
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;
                    
                    // Draw image to canvas
                    this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                    
                    // Get image data for QR code detection
                    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                    resolve(imageData);
                };
                
                img.onerror = () => {
                    reject(new Error('Error loading the image.'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('Error reading the file.'));
            };
            
            reader.readAsDataURL(file);
        });
    }
}

export default CameraModule;