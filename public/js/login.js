async function login() {
    /*// Function to handle "Login" button click
    alert("Login button clicked!");
    */
    // Add your logic here
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('All fields are required');
        return;
    }

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (result.success) {
        alert('Login successful');
    } else {
        alert(result.message);
    }
}

async function hashPassword(password) {
    const response = await fetch('/hash-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    });

    const result = await response.json();
    return result.hashedPassword;
}

function createAccount() {
    // Function to handle "Create Account" button click
    alert("Create Account button clicked!");
    // Add your logic here
}

function forgotPassword() {
    // Function to handle "Forgot Password?" link click
    alert("Forgot Password? link clicked!");
    // Add your logic here
}

// Add event listener for the "Forgot Password?" link
document.addEventListener('DOMContentLoaded', (event) => {
    const forgotPasswordLink = document.querySelector('.login-forgot-password');
    forgotPasswordLink.addEventListener('click', (event) => {
        event.preventDefault();
        forgotPassword();
    });
});