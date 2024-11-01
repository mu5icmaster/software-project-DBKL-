// public/js/face-rec.js
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
          const uploadedImage = document.getElementById("uploadedImage");
          uploadedImage.src = e.target.result;
          uploadedImage.style.display = "block";
      };
      reader.readAsDataURL(file);
  }
});

const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const captureButton = document.getElementById("captureButton");
const capturedImage = document.getElementById("capturedImage");

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
      video.srcObject = stream;
  })
  .catch(err => {
      console.error("Error accessing webcam: ", err);
  });

captureButton.addEventListener("click", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  capturedImage.src = canvas.toDataURL("image/png");
  capturedImage.style.display = "block";
});

document.getElementById("compareButton").addEventListener("click", async () => {
  const formData = new FormData();

  // Add uploaded image
  const fileInput = document.getElementById("fileInput");
  if (fileInput.files[0]) {
      formData.append("uploadedImage", fileInput.files[0]);
  }

  // Add captured image from webcam
  const capturedBlob = await fetch(capturedImage.src).then(res => res.blob());
  formData.append("capturedImage", capturedBlob, "captured.png");

  const response = await fetch("/api/compare-face", {
      method: "POST",
      body: formData
  });

  const result = await response.json();
  document.getElementById("result").innerText = result.message;
});
