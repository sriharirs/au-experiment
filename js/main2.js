import {
  FilesetResolver,
  FaceLandmarker,
  DrawingUtils,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/vision_bundle.mjs";

// DOM references
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const column1 = document.getElementById("video-blend-shapes-column1");
const auSelect = document.getElementById("actionUnits");

// Populate AU dropdown
const auList = [
  "AU 1 (Inner Brow Raiser)",
  "AU 2 (Outer Brow Raiser)",
  "AU 4 (Brow Lowerer)",
  "AU 5 (Upper Lid Raiser)",
  "AU 6 (Cheek Raiser)",
  "AU 7 (Lid Tightener)",
  "AU 9 (Nose Wrinkler)",
  "AU 12 (Lip Corner Puller)",
  "AU 14 (Dimpler)",
  "AU 15 (Lip Corner Depressor)",
  "AU 17 (Chin Raiser)",
  "AU 20 (Lip Stretcher)",
  "AU 23 (Lip Tightener)",
  "AU 26 (Jaw Drop)",
];

auList.forEach((au) => {
  const option = document.createElement("option");
  option.value = au;
  option.textContent = au;
  auSelect.appendChild(option);
});

let faceLandmarker;
let webcamRunning = false;
let lastVideoTime = -1;
let drawingUtils;

// Load the model
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

  // Enable buttons after model is loaded
  document.getElementById("webcamButton").disabled = false;
  document.getElementById("glassButton").disabled = false;
  document.getElementById("saveDataButton").disabled = false;
});

// Enable webcam
document.getElementById("webcamButton").addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.addEventListener("loadeddata", () => {
    webcamRunning = true;
    predictWebcam();
  });
});

// Main prediction loop
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

      // Display blendshape values
      column1.innerHTML = categories
        .map(
          (c) =>
            `<li><strong>${c.categoryName}</strong>: ${c.score.toFixed(4)}</li>`
        )
        .join("");

      // Avatar update (placeholder)
      draw3dScene(results);

      // Pass AU values to saving logic
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

// --- Placeholder for avatar rendering ---
function draw3dScene(results) {
  // Your avatar rendering code should go here (e.g., Three.js, Babylon.js)
  // This is a placeholder that currently does nothing.
}
