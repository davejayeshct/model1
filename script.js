// Teachable Machine Model Configuration
const URL = "https://teachablemachine.withgoogle.com/models/CW1lUc676/";

let model, webcam, labelContainer, maxPredictions;
let isRunning = false;

// Debug mode - logs all steps
const DEBUG = true;

function debugLog(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    // Also update status for important messages
    if (type === "important" || type === "error") {
        setStatus(logMessage, type === "error" ? "error" : "info");
    }
}

// Check if Teachable Machine libraries are loaded
function checkLibraries() {
    debugLog("Checking libraries...", "important");
    debugLog("tf available: " + (typeof tf !== 'undefined'));
    debugLog("tmImage available: " + (typeof tmImage !== 'undefined'));
    
    if (typeof tf === 'undefined' || typeof tmImage === 'undefined') {
        debugLog("Error: Libraries failed to load", "error");
        return false;
    }
    
    debugLog("✓ All libraries loaded successfully", "important");
    return true;
}

// Initialize the model and setup webcam
async function init() {
    try {
        // Check if libraries are loaded
        if (!checkLibraries()) {
            debugLog("Required libraries not loaded", "error");
            return;
        }

        setStatus("Loading model...", "info");
        debugLog("Starting model initialization...", "important");
        
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        debugLog("Model URL: " + modelURL, "important");
        debugLog("Metadata URL: " + metadataURL, "important");
        
        // Check if tmImage.load exists
        if (typeof tmImage.load !== 'function') {
            throw new Error("tmImage.load function not found");
        }

        debugLog("Loading model from Google Teachable Machine...", "important");
        const startTime = Date.now();
        
        model = await tmImage.load(modelURL, metadataURL);
        
        const loadTime = Date.now() - startTime;
        debugLog("✓ Model loaded successfully in " + loadTime + "ms", "important");
        
        maxPredictions = model.getTotalClasses();
        debugLog("Number of classes: " + maxPredictions, "important");

        // Setup webcam with error handling
        debugLog("Initializing webcam...", "important");
        
        const flip = true;
        webcam = new tmImage.Webcam(200, 200, flip);
        
        debugLog("Requesting camera access...", "important");
        await webcam.setup({ width: 200, height: 200 });
        
        debugLog("✓ Webcam setup complete", "important");
        debugLog("Starting webcam playback...", "important");
        
        await webcam.play();
        
        debugLog("✓ Webcam playback started", "important");
        
        isRunning = true;
        setStatus("✓ Webcam started! Model is ready.", "success");
        
        // Append webcam canvas to the DOM
        const container = document.getElementById("webcam-container");
        container.innerHTML = "";
        container.appendChild(webcam.canvas);
        debugLog("Webcam canvas added to page", "important");

        // Setup label container for predictions
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = "";
        
        for (let i = 0; i < maxPredictions; i++) {
            const div = document.createElement("div");
            div.style.padding = "8px";
            labelContainer.appendChild(div);
        }
        
        debugLog("Prediction container initialized", "important");

        // Toggle button visibility
        document.getElementById("startBtn").style.display = "none";
        document.getElementById("stopBtn").style.display = "flex";

        // Start the prediction loop
        debugLog("Starting prediction loop...", "important");
        window.requestAnimationFrame(loop);

    } catch (error) {
        debugLog("========== ERROR ==========", "error");
        debugLog("Error during initialization: " + error.message, "error");
        debugLog("Error name: " + error.name, "error");
        debugLog("Error stack: " + error.stack, "error");
        debugLog("===========================", "error");
        
        let errorMsg = "Error initializing webcam";
        
        // Specific error messages
        if (error.name === "NotAllowedError" || error.message.includes("NotAllowedError")) {
            errorMsg = "❌ Camera access denied. Please allow webcam access in browser settings.";
        } else if (error.name === "NotFoundError" || error.message.includes("NotFoundError")) {
            errorMsg = "❌ No webcam found. Please connect a camera device.";
        } else if (error.message.includes("network")) {
            errorMsg = "❌ Network error. Check your internet connection.";
        } else if (error.message.includes("Failed to load")) {
            errorMsg = "❌ Failed to load model. Check internet connection and refresh.";
        } else if (error.message.includes("tmImage")) {
            errorMsg = "❌ Teachable Machine library failed to load. Try refreshing the page.";
        } else {
            errorMsg = "❌ " + error.message || "Unknown error occurred";
        }
        
        setStatus(errorMsg, "error");
        
        // Re-enable start button
        document.getElementById("startBtn").style.display = "flex";
        document.getElementById("stopBtn").style.display = "none";
    }
}

// Main prediction loop
async function loop() {
    if (isRunning) {
        try {
            webcam.update();
            await predict();
            window.requestAnimationFrame(loop);
        } catch (error) {
            debugLog("Error in prediction loop: " + error.message, "error");
            isRunning = false;
        }
    }
}

// Run predictions on the webcam image
async function predict() {
    try {
        const prediction = await model.predict(webcam.canvas);

        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction = prediction[i];
            const probability = (classPrediction.probability * 100).toFixed(2);
            const predictionText = `<strong>${classPrediction.className}:</strong> ${probability}%`;
            labelContainer.childNodes[i].innerHTML = predictionText;
        }
    } catch (error) {
        debugLog("Prediction error: " + error.message, "error");
    }
}

// Stop the webcam
function stopWebcam() {
    try {
        if (webcam && isRunning) {
            isRunning = false;
            webcam.stop();
            debugLog("Webcam stopped", "important");
        }
        
        document.getElementById("webcam-container").innerHTML = 
            '<p style="color: #999; padding: 20px;">Webcam stopped</p>';
        
        document.getElementById("startBtn").style.display = "flex";
        document.getElementById("stopBtn").style.display = "none";
        
        setStatus("Webcam stopped.", "info");
    } catch (error) {
        debugLog("Error stopping webcam: " + error.message, "error");
    }
}

// Set status message
function setStatus(message, type = "info") {
    const statusEl = document.getElementById("status");
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = "status-message " + type;
    }
}

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
    if (webcam && isRunning) {
        webcam.stop();
    }
});

// Initial status message when page loads
window.addEventListener("load", () => {
    debugLog("=== PAGE LOADED ===", "important");
    debugLog("Teachable Machine App Starting...", "important");
    checkLibraries();
    setStatus("Click 'Start Webcam' to begin the model", "info");
});

// Log script initialization
debugLog("=== SCRIPT LOADED ===", "important");
debugLog("TensorFlow.js and Teachable Machine libraries are loading...", "important");
debugLog("Model URL: " + URL, "important");
