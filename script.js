// Teachable Machine Model Configuration
const URL = "https://teachablemachine.withgoogle.com/models/CW1lUc676/";

let model, webcam, labelContainer, maxPredictions;
let isRunning = false;

// Debug mode - logs all steps
const DEBUG = true;

// Prediction tracking
let predictionHistory = [];
let predictionStats = {
    class1Total: 0,
    class2Total: 0,
    count: 0
};

function debugLog(message, type = "info") {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
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
        
        const container = document.getElementById("webcam-container");
        container.innerHTML = "";
        container.appendChild(webcam.canvas);
        debugLog("Webcam canvas added to page", "important");

        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = "";
        
        for (let i = 0; i < maxPredictions; i++) {
            const div = document.createElement("div");
            div.style.padding = "8px";
            labelContainer.appendChild(div);
        }
        
        debugLog("Prediction container initialized", "important");

        document.getElementById("startBtn").style.display = "none";
        document.getElementById("stopBtn").style.display = "flex";

        debugLog("Starting prediction loop...", "important");
        window.requestAnimationFrame(loop);

    } catch (error) {
        debugLog("========== ERROR ==========", "error");
        debugLog("Error during initialization: " + error.message, "error");
        debugLog("Error name: " + error.name, "error");
        debugLog("Error stack: " + error.stack, "error");
        debugLog("===========================", "error");
        
        let errorMsg = "Error initializing webcam";
        
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

        // Track statistics
        const class1Prob = parseFloat((prediction[0].probability * 100).toFixed(2));
        const class2Prob = parseFloat((prediction[1].probability * 100).toFixed(2));
        
        predictionStats.class1Total += class1Prob;
        predictionStats.class2Total += class2Prob;
        predictionStats.count += 1;
        
        // Store in history
        predictionHistory.push({
            class1: class1Prob,
            class2: class2Prob
        });
        
        // Keep last 100 predictions
        if (predictionHistory.length > 100) {
            predictionHistory.shift();
        }
        
        // Every 30 predictions (about 1 second), log stats
        if (predictionStats.count % 30 === 0) {
            const avgClass1 = (predictionStats.class1Total / predictionStats.count).toFixed(2);
            const avgClass2 = (predictionStats.class2Total / predictionStats.count).toFixed(2);
            console.log(`📊 AVERAGE (last ${predictionStats.count} frames): Class 1: ${avgClass1}% | Class 2: ${avgClass2}%`);
        }

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

// Get prediction statistics
function getPredictionStats() {
    if (predictionStats.count === 0) {
        console.log("No predictions yet");
        return;
    }
    
    const avgClass1 = (predictionStats.class1Total / predictionStats.count).toFixed(2);
    const avgClass2 = (predictionStats.class2Total / predictionStats.count).toFixed(2);
    
    console.log("===== PREDICTION STATISTICS =====");
    console.log(`Total Frames Analyzed: ${predictionStats.count}`);
    console.log(`Average Class 1: ${avgClass1}%`);
    console.log(`Average Class 2: ${avgClass2}%`);
    console.log(`Dominant Class: ${avgClass1 > avgClass2 ? 'Class 1' : 'Class 2'}`);
    console.log(`Confidence: ${Math.abs(avgClass1 - avgClass2).toFixed(2)}%`);
    console.log("==================================");
}

// Reset statistics
function resetStats() {
    predictionHistory = [];
    predictionStats = {
        class1Total: 0,
        class2Total: 0,
        count: 0
    };
    console.log("✓ Statistics reset");
}

// Stop the webcam
function stopWebcam() {
    try {
        if (webcam && isRunning) {
            isRunning = false;
            webcam.stop();
            debugLog("Webcam stopped", "important");
            
            // Show final stats
            getPredictionStats();
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

// Make functions available in console
window.getPredictionStats = getPredictionStats;
window.resetStats = resetStats;
