let currentStep = 1;

document.addEventListener('DOMContentLoaded', (event) => {
    const submitButton = document.getElementById('submit-button');
    submitButton.addEventListener('click', (event) => {
        event.preventDefault();
        nextStep();
    });
});

function nextStep() {
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    const nextStepElement = document.getElementById(`step-${currentStep + 1}`);
    const submitButton = document.getElementById('submit-button');

    if (nextStepElement) {
        currentStepElement.style.display = 'none';
        nextStepElement.style.display = 'flex';
        currentStep++;

        if (currentStep === 2) {
            submitButton.textContent = 'Continue';
        }

        // If this is the last step, change the button text and function
        if (!document.getElementById(`step-${currentStep + 1}`)) {
            submitButton.innerHTML = '<img src="images/camera.svg" alt="Camera Icon">';
            submitButton.classList.add('round');
            submitButton.onclick = () => {
                // Submit Logic
            };
        }

    }
}

/*
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const captureBtn = document.getElementById('captureBtn');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const loginForm = document.getElementById('loginForm');
const output = document.getElementById('output');


// Access the user's webcam
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((error) => {
        console.error('Error accessing camera: ', error);
    });

// Capture the photo
captureBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/png');
    preview.src = imageData;
});

// Automatically get the user's location when the page loads
window.addEventListener('load', () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Hidden inputs for storing location (can be used in the form)
        const latitudeField = document.createElement('input');
        latitudeField.type = 'hidden';
        latitudeField.id = 'latitude';
        latitudeField.name = 'latitude';
        latitudeField.value = latitude;

        const longitudeField = document.createElement('input');
        longitudeField.type = 'hidden';
        longitudeField.id = 'longitude';
        longitudeField.name = 'longitude';
        longitudeField.value = longitude;

        loginForm.appendChild(latitudeField);
        loginForm.appendChild(longitudeField);
    }, (error) => {
        console.error('Error fetching location: ', error);
    });
});

*/