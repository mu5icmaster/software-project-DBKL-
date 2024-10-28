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

            fetchLocation();
        }

        if (currentStep === 3) {
            submitButton.innerHTML = '<img src="images/camera.svg" alt="Camera Icon">';
            submitButton.classList.add('round');

            initializeCamera();
            submitButton.onclick = submit;
        };

        // if (!document.getElementById(`step-${currentStep + 1}`)) 
    }
}

async function submit() {
    const sessionResponse = await fetch('/session-info');
    const sessionData = await sessionResponse.json();
    const userID = sessionData.userID;

    const image = captureCamera();
    const latitude = localStorage.getItem('latitude');
    const longitude = localStorage.getItem('longitude');

    console.log('UserID in submit function:', userID);
    console.log('Submitting:', userID, latitude, longitude, image);

    const response = await fetch('/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userID: userID,
            latitude: latitude,
            longitude: longitude,
            image: image
        })
    });

    const result = await response.json();
    
    if (result.success) {
        alert('Image and data saved successfully');

        const currentStepElement = document.getElementById(`step-3`);
        const nextStepElement = document.getElementById(`step-4`);
        const button = document.getElementById('submit-button');

        currentStepElement.style.display = 'none';
        nextStepElement.style.display = 'flex';
        button.style.display = 'none';
    }
}

function fetchLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        localStorage.setItem('latitude', latitude);
        localStorage.setItem('longitude', longitude);
    }, (error) => {
        console.error('Error fetching location: ', error);
        alert('Unable to fetch location. Please ensure location services are enabled and try again.');
    });
}

function initializeCamera() {
    const video = document.getElementById('video');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
        })
        .catch((error) => {
            console.error('Error accessing camera: ', error);
            alert('Unable to access camera. Please ensure camera permissions are granted and try again.');
        });
}

function captureCamera() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');

    return imageData;
}

