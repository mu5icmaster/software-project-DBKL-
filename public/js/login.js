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