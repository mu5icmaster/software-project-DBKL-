let currentStep = 1;

document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
    });

    const nextRegisterButton = document.getElementById('register-next-button');
    nextRegisterButton.addEventListener('click', (event) => {
        event.preventDefault();
        nextStep();
    });
});

function nextStep() {
    const currentStepElement = document.getElementById(`step-${currentStep}`);
    const nextStepElement = document.getElementById(`step-${currentStep + 1}`);
    const button = document.getElementById('register-next-button');

    if (nextStepElement) {
        currentStepElement.style.display = 'none';
        nextStepElement.style.display = 'block';
        currentStep++;

        // If this is the last step, change the button text and function
        if (!document.getElementById(`step-${currentStep + 1}`)) {
            button.textContent = 'Register';
        }

    } else {
        // If there are no more steps, submit the form
        register();
    }
}

async function register() {
    const formData = new FormData(document.getElementById('register-form'));
    console.log('Form data:', formData);
    console.log('registering...');

    try {
        const response = await fetch('/register', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        // console.log('Success:', data);

        if (data.success) {
            // Handle success (e.g., redirect to another page)
            alert('Registration successful!');
            window.location.href = 'login.html'; // Redirect to the dashboard or another page
        } else {
            // Handle failure (e.g., show error message)
            alert(`Registration failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        // Handle error (e.g., show error message)
        alert('An error occurred during registration. Please try again.');
    }
}