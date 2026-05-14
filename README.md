# Teachable Machine Image Model

A web-based image classification application using Google's Teachable Machine and TensorFlow.js for real-time webcam-based predictions.

## Features

- **Real-time Image Classification**: Uses webcam feed for live predictions
- **TensorFlow.js Integration**: Runs inference directly in the browser
- **Google Teachable Machine Model**: Pre-trained model for image classification
- **Responsive Design**: Works on desktop and mobile devices
- **No Backend Required**: Fully client-side processing

## Model Information

- **Model ID**: CW1lUc676
- **Access**: [Teachable Machine Model](https://teachablemachine.withgoogle.com/models/CW1lUc676/)
- **Framework**: TensorFlow.js

## Files

- **index.html**: Main HTML structure with webcam container and predictions display
- **style.css**: Modern styling with gradient backgrounds and responsive layout
- **script.js**: JavaScript logic for model loading, webcam setup, and real-time predictions
- **README.md**: This file with documentation

## How to Use

1. Open `index.html` in a web browser
2. Click the **"Start Webcam"** button
3. Allow browser access to your webcam when prompted
4. The model will display predictions in real-time below the webcam feed
5. Click **"Stop Webcam"** to stop the camera

## Requirements

- Modern web browser with JavaScript enabled
- Webcam/camera access
- Internet connection (for loading TensorFlow.js and the model)

## Browser Compatibility

- Chrome/Chromium: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Edge: ✅ Fully supported

## Technology Stack

- **TensorFlow.js**: Machine learning library for JavaScript
- **Teachable Machine**: Google's tool for creating ML models without coding
- **HTML5**: Semantic markup
- **CSS3**: Modern styling and animations
- **Vanilla JavaScript**: No frameworks required

## Error Handling

- Webcam permission errors are handled gracefully
- Prediction errors are logged to console without breaking the application
- Cleanup on page unload to release webcam resources

## Performance

- Lightweight model suitable for real-time inference
- Runs entirely in the browser (no backend API calls)
- Optimized for low-latency predictions

## License

This project uses Google's Teachable Machine service. Please refer to their terms of service for model usage.

## References

- [Teachable Machine Documentation](https://teachablemachine.withgoogle.com/)
- [TensorFlow.js Documentation](https://js.tensorflow.org/)
- [GitHub Repository](https://github.com/googlecreativelab/teachablemachine-community)
