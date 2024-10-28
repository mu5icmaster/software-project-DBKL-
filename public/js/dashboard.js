document.addEventListener('DOMContentLoaded', (event) => {
    const navToggleButton = document.querySelector('.navigation-toggle-button');
    navToggleButton.addEventListener('click', toggleNav);

    // Add event listeners for navigation links
    document.getElementById('navigation-map').addEventListener('click', () => loadContent('nav-map.html', 'css/nav-map.css', ["https://maps.googleapis.com/maps/api/js?key=AIzaSyBj4jxx1zcP9feFQtHdtLVppdmanPgTXO8&callback=initMap"]));
    document.getElementById('navigation-user').addEventListener('click', () => loadContent('nav-user.html', 'css/nav-user.css', ["https://code.jquery.com/jquery-3.7.1.min.js", "https://cdn.datatables.net/v/dt/dt-2.1.8/b-3.1.2/sl-2.1.0/datatables.min.js", 'js/nav-user.js']));
    document.getElementById('navigation-employee').addEventListener('click', () => loadContent('nav-employee.html', 'css/nav-employee.css', ['js/nav-employee.js']));
    document.getElementById('navigation-admin').addEventListener('click', () => loadContent('nav-admin.html', 'css/nav-admin.css', ["https://code.jquery.com/jquery-3.7.1.min.js", "https://cdn.datatables.net/v/dt/dt-2.1.8/b-3.1.2/sl-2.1.0/datatables.min.js", 'js/nav-admin.js']));

    // Load default content
    loadContent('nav-user.html', 'css/nav-user.css', ['js/nav-user.js', "https://code.jquery.com/jquery-3.7.1.min.js", "https://cdn.datatables.net/v/dt/dt-2.1.8/b-3.1.2/sl-2.1.0/datatables.min.js"]);
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

function loadJS(jsFiles) {
    // Remove any previously loaded JavaScript
    const existingScripts = document.querySelectorAll('script[data-dynamic]');
    if (existingScripts) {
        console.log(existingScripts);
        existingScripts.forEach(script => {
            script.remove();
        });
    }

    console.log(jsFiles);

    // Load new script
    jsFiles.forEach(js => {
        const script = document.createElement('script');
        script.src = js;
        script.setAttribute('data-dynamic', 'true');

        // Add async and defer attributes for Google Maps script
        if (js.includes('maps.googleapis.com')) {
            console.log('Adding async and defer attributes');
            script.async = true;
            script.defer = true;
        }
        
        document.body.appendChild(script);
    });
}

