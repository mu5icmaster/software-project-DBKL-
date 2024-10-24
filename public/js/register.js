let currentStep = 1;

document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        register(event);
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
            nextButton.textContent = 'Register';
            nextButton.onclick = () => {
                document.getElementById('register-form').submit();
            };
        }

    } else {
        // If there are no more steps, submit the form
        document.getElementById('register-form').submit();
    }
}

async function register(event) {
    const formData = new FormData(event.target);

    try {
        const response = await fetch('/register', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('Success:', data);

        if (data.success) {
            // Handle success (e.g., redirect to another page)
            alert('Registration successful!');
            window.location.href = '/dashboard'; // Redirect to the dashboard or another page
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