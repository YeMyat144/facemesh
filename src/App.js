import React, {useRef, useState} from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import Webcam from 'react-webcam';
import {drawMesh} from './utilities';

function App() {
  // Setup references
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // State to control the camera
  const [isCameraOn, setIsCameraOn] = useState(false);

  // Load facemesh model
  const runFacemesh = async () => {
    const net = await facemesh.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8
    });
    setInterval(() => {
      if (isCameraOn) {
        detect(net);
      }
    }, 100);
  }

  // Detect function
  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" && 
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
      const ctx = canvasRef.current.getContext("2d");
      requestAnimationFrame(() => { drawMesh(face, ctx) });
    }
  }

  // Toggle camera on/off
  const toggleCamera = () => {
    setIsCameraOn(prevState => !prevState);
  }

  runFacemesh();

  return (
    <div className="App">
      <header className="App-header">
        {isCameraOn && (
          <>
            <Webcam ref={webcamRef} style={{
              position: 'absolute',
              marginLeft: 'auto',
              marginRight: 'auto',
              left: 0,
              right: 0,
              textAlign: 'center',
              zIndex: 9,
              width: 640,
              height: 480
            }} />
            <canvas ref={canvasRef} style={{
              position: 'absolute',
              marginLeft: 'auto',
              marginRight: 'auto',
              left: 0,
              right: 0,
              textAlign: 'center',
              zIndex: 9,
              width: 640,
              height: 480
            }} />
          </>
        )}
        <button onClick={toggleCamera} style={{
          position: 'relative',
          zIndex: 10,
          marginTop: isCameraOn ? '550px' : '20px',
          marginBottom: isCameraOn ? '20px' : '0px',
        }}>
          {isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
        </button>
      </header>
    </div>
  );
}

export default App;
