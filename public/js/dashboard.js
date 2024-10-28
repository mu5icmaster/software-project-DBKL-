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

<<<<<<< HEAD
const users = [
    { name: 'User 1', lat: 3.139, lng: 101.6869, status: 'green' },
    { name: 'User 2', lat: 3.139, lng: 101.6969, status: 'yellow' },
    { name: 'User 3', lat: 3.139, lng: 101.7069, status: 'red' }
];

// In your initMap function
function initMap() {
    const initialLocation = { lat: 3.139, lng: 101.6869 };
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: initialLocation
    });

    users.forEach(user => {
        let markerColor;

        if (user.status === 'green') {
            markerColor = 'green.png'; // URL to green marker image
        } else if (user.status === 'yellow') {
            markerColor = 'yellow.png'; // URL to yellow marker image
        } else {
            markerColor = 'red.png'; // URL to red marker image
        }

        const marker = new google.maps.Marker({
            position: { lat: user.lat, lng: user.lng },
            map: map,
            icon: `/path/to/icons/${markerColor}` //  marker icon URL
        });

        // Bind a popup with user info
        const infoWindow = new google.maps.InfoWindow({
            content: `${user.name}: ${user.status}`
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });
}
=======
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

>>>>>>> 2da4b022c3e990f18fc1a11dfb6c07c5ba0f57e4
