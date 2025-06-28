// ... (existing imports and initial setup)

async function predictWebcam() {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  const nowInMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = faceLandmarker.detectForVideo(video, nowInMs);
  }

  if (results.faceLandmarks) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030", lineWidth: 1 },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030", lineWidth: 1 },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30", lineWidth: 1 },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30", lineWidth: 1 },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0", lineWidth: 1 },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: "#E0E0E0", lineWidth: 1 },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030", lineWidth: 1 },
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30", lineWidth: 1 },
      );
    }
  }

  if (results.faceBlendshapes.length > 0) {
    column1.innerHTML = printBlendShapes(results.faceBlendshapes[0].categories);
    draw3dScene(results);

    // --- BEGIN: AU Logging Integration ---
    // Gather all blendshape/AU values into a JS object
    const auValues = {};
    for (const cat of results.faceBlendshapes[0].categories) {
      auValues[cat.categoryName] = cat.score;
    }
    // Log them to the browser console every frame
    console.log(auValues);
    // --- END: AU Logging Integration ---
  }

  if (webcamRunning) {
    window.requestAnimationFrame(predictWebcam);
  } else {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }
}

// ... (rest of your code remains unchanged)