// Teachable Machine Model Configuration
const URL = "https://teachablemachine.withgoogle.com/models/CW1lUc676/";

let model, webcam, labelContainer, maxPredictions;
let isRunning = false;

// Initialize the model and setup webcam
async function init() {
    try {
        setStatus("Loading model...", "info");
        
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // Load the model and metadata
        console.log("Loading model from:", modelURL);
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Model loaded. Total classes:", maxPredictions);

        // Setup webcam
        const flip = true; // Flip the webcam for mirror effect
        webcam = new tmImage.Webcam(200, 200, flip);
        
        console.log("Setting up webcam...");
        await webcam.setup(); // Request access to the webcam
        console.log("Webcam setup complete, starting playback...");
        
        await webcam.play();
        console.log("Webcam playback started");
        
        isRunning = true;
        setStatus("✓ Webcam started! Model is ready.", "success");
        
        // Append webcam canvas to the DOM
        const container = document.getElementById("webcam-container");
        container.innerHTML = ""; // Clear previous content
        container.appendChild(webcam.canvas);

        // Setup label container for predictions
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = ""; // Clear previous predictions
        
        for (let i = 0; i < maxPredictions; i++) {
            const div = document.createElement("div");
            div.style.padding = "8px";
            labelContainer.appendChild(div);
        }

        // Toggle button visibility
        document.getElementById("startBtn").style.display = "none";
        document.getElementById("stopBtn").style.display = "flex";

        // Start the prediction loop
        window.requestAnimationFrame(loop);

    } catch (error) {
        console.error("Error initializing model:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        let errorMsg = "Error: " + error.message;
        
        // Specific error messages
        if (error.message.includes("NotAllowedError")) {
            errorMsg = "Camera access denied. Please allow webcam access in browser settings.";
        } else if (error.message.includes("NotFoundError")) {
            errorMsg = "No webcam found. Please connect a camera device.";
        } else if (error.message.includes("network")) {
            errorMsg = "Network error. Check your internet connection.";
        } else if (error.message === "undefined") {
            errorMsg = "Webcam initialization failed. Please check browser permissions or try a different browser.";
        }
        
        setStatus(errorMsg, "error");
    }
}

// Main prediction loop
async function loop() {
    if (isRunning) {
        webcam.update(); // Update the webcam frame
        await predict();
        window.requestAnimationFrame(loop);
    }
}

// Run predictions on the webcam image
async function predict() {
    try {
        // Get predictions from the model
        const prediction = await model.predict(webcam.canvas);

        // Display predictions
        for (let i = 0; i < maxPredictions; i++) {
            const classPrediction = prediction[i];
            const probability = (classPrediction.probability * 100).toFixed(2);
            
            const predictionText = 
                `<strong>${classPrediction.className}:</strong> ${probability}%`;
            
            labelContainer.childNodes[i].innerHTML = predictionText;
        }
    } catch (error) {
        console.error("Error during prediction:", error);
    }
}

// Stop the webcam
function stopWebcam() {
    if (webcam) {
        isRunning = false;
        webcam.stop();
        document.getElementById("webcam-container").innerHTML = 
            '<p style="color: #999; padding: 20px;">Webcam stopped</p>';
        
        // Toggle button visibility
        document.getElementById("startBtn").style.display = "block";
        document.getElementById("stopBtn").style.display = "none";
        
        setStatus("Webcam stopped.", "info");
    }
}

// Set status message
function setStatus(message, type = "info") {
    const statusEl = document.getElementById("status");
    statusEl.textContent = message;
    statusEl.className = "status-message " + type;
}

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
    if (webcam && isRunning) {
        stopWebcam();
    }
});

// Initial status message
window.addEventListener("load", () => {
    console.log("Page loaded, application ready");
    setStatus("Click 'Start Webcam' to begin the model", "info");
});
