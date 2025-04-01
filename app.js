document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const video = document.getElementById('qr-video');
    const canvas = document.getElementById('qr-canvas');
    const ctx = canvas.getContext('2d');
    const resultDiv = document.getElementById('result');
    const errorMessage = document.getElementById('error-message');
    const historyContainer = document.getElementById('history-container');
    const startButton = document.getElementById('start-button');
    const stopButton = document.getElementById('stop-button');
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    
    // Variables
    let scanning = false;
    let stream = null;
    const scanHistory = [];
    
    // Event listeners
    startButton.addEventListener('click', startScanning);
    stopButton.addEventListener('click', stopScanning);
    uploadButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    
    // Function to start the camera and scanning process
    async function startScanning() {
        try {
            // Request camera access
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            
            // Set video source and start playing
            video.srcObject = stream;
            video.setAttribute('playsinline', true); // required for iOS Safari
            await video.play();
            
            // Set canvas size to match video dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Update UI
            startButton.disabled = true;
            stopButton.disabled = false;
            errorMessage.textContent = '';
            scanning = true;
            
            // Start scanning loop
            requestAnimationFrame(scanQRCode);
        } catch (error) {
            errorMessage.textContent = `Camera error: ${error.message}`;
            console.error('Error accessing camera:', error);
        }
    }
    
    // Function to stop scanning
    function stopScanning() {
        if (stream) {
            // Stop all tracks in the stream
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            
            // Update UI
            video.srcObject = null;
            startButton.disabled = false;
            stopButton.disabled = true;
            scanning = false;
        }
    }
    
    // Function to scan for QR codes in video frames
    function scanQRCode() {
        if (!scanning) return;
        
        // Check if video is playing
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            // Draw current video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Get image data for QR code detection
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Process the image data to find QR code
            processImageData(imageData);
        }
        
        // Continue scanning
        requestAnimationFrame(scanQRCode);
    }
    
    // Function to process image data and detect QR code
    function processImageData(imageData) {
        // Use jsQR to detect QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });
        
        // If QR code is detected
        if (code) {
            // Display result
            displayResult(code.data);
        }
    }
    
    // Function to display and save scan result
    function displayResult(data) {
        // Check if this is a new scan (not the same as the last one)
        const lastScan = scanHistory.length > 0 ? scanHistory[0] : null;
        if (lastScan && lastScan.data === data) {
            return; // Skip duplicate consecutive scans
        }
        
        // Update result display
        resultDiv.textContent = data;
        
        // Add to history
        const timestamp = new Date().toLocaleString();
        scanHistory.unshift({ data, timestamp });
        
        // Update history display
        updateHistoryDisplay();
    }
    
    // Function to update the history display
    function updateHistoryDisplay() {
        historyContainer.innerHTML = '';
        
        // Display up to 10 most recent scans
        const recentScans = scanHistory.slice(0, 10);
        
        recentScans.forEach(scan => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // Try to detect if the scan is a URL
            let content = '';
            if (isURL(scan.data)) {
                content = `<a href="${scan.data}" target="_blank">${scan.data}</a>`;
            } else {
                content = scan.data;
            }
            
            historyItem.innerHTML = `
                <div><strong>${scan.timestamp}</strong></div>
                <div>${content}</div>
            `;
            
            historyContainer.appendChild(historyItem);
        });
    }
    
    // Helper function to check if a string is a URL
    function isURL(str) {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }
    
    // Function to handle file uploads
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if the file is an image
        if (!file.type.match('image.*')) {
            errorMessage.textContent = 'Please select an image file';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                // Set canvas dimensions to match image
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Draw image to canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Get image data for QR code detection
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Process the image data
                processImageData(imageData);
                
                // Clear the file input
                fileInput.value = '';
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            errorMessage.textContent = 'Error reading the file';
        };
        
        reader.readAsDataURL(file);
    }
    
    // Check if the browser supports the required APIs
    function checkBrowserSupport() {
        let hasMediaSupport = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        
        if (!hasMediaSupport) {
            errorMessage.textContent = 'Your browser does not support camera access. You can still upload QR code images.';
            startButton.disabled = true;
        } else {
            errorMessage.textContent = 'Click "Start Camera" to begin scanning or upload a QR code image';
        }
        
        // File API is supported by all modern browsers, but check anyway
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            errorMessage.textContent += ' Your browser does not fully support the File API needed for image uploads.';
            uploadButton.disabled = true;
            return false;
        }
        
        return true;
    }
    
    // Initialize the application
    function init() {
        checkBrowserSupport();
    }
    
    // Start the application
    init();
});