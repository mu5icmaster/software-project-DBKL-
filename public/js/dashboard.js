document.addEventListener('DOMContentLoaded', (event) => {
    const navToggleButton = document.querySelector('.navigation-toggle-button');
    navToggleButton.addEventListener('click', toggleNav);

    // Add event listeners for navigation links
    document.getElementById('navigation-map').addEventListener('click', () => loadContent('nav-map.html', 'css/nav-map.css', 'js/nav-map.js'));
    document.getElementById('navigation-user').addEventListener('click', () => loadContent('nav-user.html', 'css/nav-user.css', 'js/nav-user.js'));
    document.getElementById('navigation-employee').addEventListener('click', () => loadContent('nav-employee.html', 'css/nav-employee.css', 'js/nav-employee.js'));
    document.getElementById('navigation-admin').addEventListener('click', () => loadContent('nav-admin.html', 'css/nav-admin.css', 'js/nav-admin.js'));

    // Load default content
    loadContent('nav-user.html', 'css/nav-user.css', 'js/nav-user.js');
});

function toggleNav() {
    const navigationBar = document.getElementById('navigation-bar');
    const mainContent = document.querySelector('.main-container');

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

function loadContent(html, css, js) {
    fetch(html)
        .then(response => response.text())
        .then(html => {
            document.querySelector('.main-container').innerHTML = html;
            loadCSS(css);
            loadJS(js);
        })
        .catch(error => console.error('Error loading content:', error));
}

function loadCSS(css) {
    // Remove any previously loaded CSS
    const existingLink = document.querySelector('link[data-dynamic]');
    if (existingLink) {
        existingLink.remove();
    }

    // Load new CSS
    const link = document.createElement('link');
    link.href = css;
    link.rel = 'stylesheet';
    // link.type = 'text/css';
    link.setAttribute('data-dynamic', 'true');
    document.head.appendChild(link);
}

function loadJS(js) {
    // Remove any previously loaded JavaScript
    const existingScript = document.querySelector('script[data-dynamic]');
    if (existingScript) {
        existingScript.remove();
    }

    // Load new script
    const script = document.createElement('script');
    script.src = js;
    // script.type = 'text/javascript';
    script.setAttribute('data-dynamic', 'true');
    document.body.appendChild(script);
}

