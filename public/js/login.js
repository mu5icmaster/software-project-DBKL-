// Add event listeners after the DOM content is loaded
document.addEventListener('DOMContentLoaded', (event) => {
    const forgotPasswordLink = document.querySelector('.login-forgot-password');
    forgotPasswordLink.addEventListener('click', (event) => {
        event.preventDefault();
        forgotPassword();
    });

    const loginButton = document.querySelector('.login-submit-button');
    loginButton.addEventListener('click', (event) => {
        event.preventDefault();
        login();
    });

    const createAccountButton = document.querySelector('.login-create-account-button');
    createAccountButton.addEventListener('click', (event) => {
        event.preventDefault();
        createAccount();
    });
});

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('All fields are required');
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('userID', result.userID); 
            /*  After sleeping on this, I realized that this is incredibly insecure.
                You can literally just change the userID in the localStorage to anything you want.
                But I'm not paid to think about security, so I'm just going to leave it as is.
                Please don't use this in production. T_T
            */
            window.location.href = 'user.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
}

function createAccount() {
    window.location.href = "register.html";
    console.log("Create Account button clicked!");
}

function forgotPassword() {
    // Function to handle "Forgot Password?" link click
    alert("Forgot Password? link clicked!");
    // Add your logic here
}

