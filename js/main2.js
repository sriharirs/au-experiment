import {
  FaceLandmarker,
  FilesetResolver,
  DrawingUtils
} from "@mediapipe/tasks-vision";

const demosSection = document.getElementById("demos");
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const column1 = document.getElementById("video-blend-shapes-column1");

let faceLandmarker, webcamRunning = false, lastVideoTime = -1;
const drawingUtils = new DrawingUtils(canvasCtx);

// Load model
async function initFaceLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-assets/face_landmarker.task",
      delegate: "GPU"
    },
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
    runningMode: "VIDEO"
  });
}

initFaceLandmarker();

document.getElementById("webcamButton").addEventListener("click", enableCam);

function enableCam() {
  if (webcamRunning) return;
  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", () => {
      webcamRunning = true;
      predictWebcam();
    });
  });
}

function predictWebcam() {
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;

  const nowInMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    const results = faceLandmarker.detectForVideo(video, nowInMs);

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.faceLandmarks) {
      for (const landmarks of results.faceLandmarks) {
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: "#C0C0C070", lineWidth: 1 });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#FF3030", lineWidth: 1 });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: "#FF3030", lineWidth: 1 });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#30FF30", lineWidth: 1 });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: "#30FF30", lineWidth: 1 });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0", lineWidth: 1 });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, { color: "#E0E0E0", lineWidth: 1 });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, { color: "#FF3030", lineWidth: 1 });
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, { color: "#30FF30", lineWidth: 1 });
      }
    }

    if (results.faceBlendshapes.length > 0) {
      const blendshapes = results.faceBlendshapes[0].categories;

      // Display blendshapes
      column1.innerHTML = blendshapes.map(bs => `<li>${bs.categoryName}: ${bs.score.toFixed(3)}</li>`).join("");

      // Save AU data for export
      const auMap = {};
      for (const b of blendshapes) {
        auMap[b.categoryName] = b.score;
      }

      // Call global AU recording function
      if (window.recordAU) {
        window.recordAU(nowInMs.toFixed(0), auMap);  // Use timestamp as key
      }
    }
  }

  if (webcamRunning) {
    window.requestAnimationFrame(predictWebcam);
  }
}
