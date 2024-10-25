document.addEventListener('DOMContentLoaded', (event) => {
    const navToggleButton = document.querySelector('.navigation-toggle-button');
    navToggleButton.addEventListener('click', toggleNav);
});

function toggleNav() {
    const navigationBar = document.getElementById('navigation-bar');
    const mainContent = document.getElementById('main');

    if (navigationBar.classList.contains('collapsed')) {
        navigationBar.classList.remove('collapsed');
        navigationBar.classList.add('expanded');
        mainContent.classList.add('expanded');
    } else {
        navigationBar.classList.remove('expanded');
        navigationBar.classList.add('collapsed');
        mainContent.classList.remove('expanded');
    }
}