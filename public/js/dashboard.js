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
