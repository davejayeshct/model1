// Teachable Machine Model Configuration
const URL = "https://teachablemachine.withgoogle.com/models/CW1lUc676/";

let model, webcam, labelContainer, maxPredictions;
let isRunning = false;

// Check if Teachable Machine libraries are loaded
function checkLibraries() {
    console.log("Checking libraries...");
    console.log("tf available:", typeof tf !== 'undefined');
    console.log("tmImage available:", typeof tmImage !== 'undefined');
    
    if (typeof tf === 'undefined' || typeof tmImage === 'undefined') {
        setStatus("Error: Libraries failed to load. Please refresh the page.", "error");
        return false;
    }
    return true;
}

// Initialize the model and setup webcam
async function init() {
    try {
        // Check if libraries are loaded
        if (!checkLibraries()) {
            console.error("Required libraries not loaded");
            return;
        }

        setStatus("Loading model...", "info");
        
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        console.log("Loading model from:", modelURL);
        
        // Check if tmImage.load exists
        if (typeof tmImage.load !== 'function') {
            throw new Error("tmImage.load function not found");
        }

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("✓ Model loaded successfully. Classes:", maxPredictions);

        // Setup webcam with error handling
        console.log("Initializing webcam...");
        
        const flip = true;
        webcam = new tmImage.Webcam(200, 200, flip);
        
        console.log("Requesting camera access...");
        await webcam.setup({ width: 200, height: 200 });
        
        console.log("✓ Webcam setup complete");
        console.log("Starting webcam playback...");
        
        await webcam.play();
        
        console.log("✓ Webcam playback started");
        
        isRunning = true;
        setStatus("✓ Webcam started! Model is ready.", "success");
        
        // Append webcam canvas to the DOM
        const container = document.getElementById("webcam-container");
        container.innerHTML = "";
        container.appendChild(webcam.canvas);

        // Setup label container for predictions
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = "";
        
        for (let i = 0; i < maxPredictions; i++) {
            const div = document.createElement("div");
            div.style.padding = "8px";
            labelContainer.appendChild(div);
        }

        // Toggle button visibility
        document.getElementById("startBtn").style.display = "none";
        document.getElementById("stopBtn").style.display = "flex";

        // Start the prediction loop
        console.log("Starting prediction loop...");
        window.requestAnimationFrame(loop);

    } catch (error) {
        console.error("========== ERROR ==========");
        console.error("Error during initialization:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        console.error("===========================");
        
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
            console.error("Error in prediction loop:", error);
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
        console.error("Prediction error:", error);
    }
}

// Stop the webcam
function stopWebcam() {
    try {
        if (webcam && isRunning) {
            isRunning = false;
            webcam.stop();
            console.log("Webcam stopped");
        }
        
        document.getElementById("webcam-container").innerHTML = 
            '<p style="color: #999; padding: 20px;">Webcam stopped</p>';
        
        document.getElementById("startBtn").style.display = "flex";
        document.getElementById("stopBtn").style.display = "none";
        
        setStatus("Webcam stopped.", "info");
    } catch (error) {
        console.error("Error stopping webcam:", error);
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
    console.log("Page loaded. Checking libraries...");
    checkLibraries();
    setStatus("Click 'Start Webcam' to begin the model", "info");
});

// Log script initialization
console.log("Script loaded. TensorFlow.js and Teachable Machine are loading...");
