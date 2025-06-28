import {
  FilesetResolver,
  FaceLandmarker,
  DrawingUtils,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs";

// DOM elements
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const column1 = document.getElementById("video-blend-shapes-column1");

let faceLandmarker;
let webcamRunning = false;
let lastVideoTime = -1;
let drawingUtils;

// Initialize face landmarker
FilesetResolver.forVisionTasks(
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
).then(async (resolver) => {
  faceLandmarker = await FaceLandmarker.createFromOptions(resolver, {
    baseOptions: {
      modelAssetPath:
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/face_landmarker.task",
      delegate: "GPU",
    },
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    numFaces: 1,
  });
  drawingUtils = new DrawingUtils(canvasElement);
  document.getElementById("webcamButton").disabled = false;
});

// Enable webcam
document.getElementById("webcamButton").addEventListener("click", async () => {
  const constraints = { video: true };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;
  video.addEventListener("loadeddata", () => {
    webcamRunning = true;
    predictWebcam();
  });
});

// Prediction loop
async function predictWebcam() {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  const nowInMs = performance.now();

  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    const results = faceLandmarker.detectForVideo(video, nowInMs);

    if (results.faceLandmarks) {
      for (const landmarks of results.faceLandmarks) {
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: "#C0C0C070", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          { color: "#FF3030", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
          { color: "#FF3030", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          { color: "#30FF30", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
          { color: "#30FF30", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
          { color: "#E0E0E0", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LIPS,
          { color: "#E0E0E0", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
          { color: "#FF3030", lineWidth: 1 }
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
          { color: "#30FF30", lineWidth: 1 }
        );
      }
    }

    if (results.faceBlendshapes.length > 0) {
      const categories = results.faceBlendshapes[0].categories;
      column1.innerHTML = categories
        .map(
          (c) =>
            `<li><strong>${c.categoryName}</strong>: ${c.score.toFixed(4)}</li>`
        )
        .join("");

      // Send values to AU recorder if available
      if (window.recordAU) {
        const auValues = {};
        for (const cat of categories) {
          auValues[cat.categoryName] = cat.score;
        }
        window.recordAU("LiveAU", auValues);
      }
    }
  }

  if (webcamRunning) {
    window.requestAnimationFrame(predictWebcam);
  } else {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  }
}
