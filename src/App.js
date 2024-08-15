import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import * as facemesh from '@tensorflow-models/facemesh';
import Webcam from 'react-webcam';
import { drawMesh } from './utilities';

function App() {
  // Setup references
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // State to control the camera
  const [isCameraOn, setIsCameraOn] = useState(false);

  // Load facemesh model
  useEffect(() => {
    const runFacemesh = async () => {
      const net = await facemesh.load({
        inputResolution: { width: 640, height: 480 },
        scale: 0.8
      });
      const interval = setInterval(() => {
        if (isCameraOn) {
          detect(net);
        }
      }, 100);

      // Cleanup function
      return () => clearInterval(interval);
    };

    runFacemesh();
  }, [isCameraOn]);

  // Detect function
  const detect = async (net) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const face = await net.estimateFaces(video);
      console.log(face);

      // Get canvas context for drawing
      const ctx = canvasRef.current.getContext('2d');
      requestAnimationFrame(() => { drawMesh(face, ctx); });
    }
  }

  // Toggle camera on/off
  const toggleCamera = () => {
    setIsCameraOn(prevState => !prevState);
  }

  return (
    <div className="App">
      <header className="App-header">
        {isCameraOn && (
          <div className="Webcam-container">
            <Webcam ref={webcamRef} style={{ width: '100%', height: '100%' }} />
            <canvas ref={canvasRef} className="canvas" />
          </div>
        )}
        <button onClick={toggleCamera}>
          {isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        </button>
      </header>
    </div>
  );
}

export default App;
