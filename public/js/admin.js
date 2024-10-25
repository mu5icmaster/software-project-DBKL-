// Initialize the map
function initMap() {
  const initialLocation = { lat: 3.139, lng: 101.6869 };
  const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: initialLocation
  });

  // Fetch user locations from the backend
  fetch('/user-locations')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log("Locations fetched from backend:", data.locations);
      data.locations.forEach(location => {
        const latLng = { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) };
        console.log("Adding marker for image:", location.image_path);
        addAdvancedMarker(latLng, map, 'red', location.image_path);
      });
    } else {
      console.error('Failed to load locations:', data.message);
    }
  })
  .catch(error => {
    console.error('Error fetching locations:', error);
  });
}

// Function to add a marker with a specific status and display an image
function addAdvancedMarker(location, map, status, imagePath) {
  let markerIcon;

  // Set marker icon based on status
  if (status === 'red') {
      markerIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  } else if (status === 'yellow') {
      markerIcon = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
  } else {
      markerIcon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
  }

  console.log("Adding marker at location:", location); // Debugging log

  // Add marker to the map
  const marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: markerIcon
  });

  // Prepare content for info window (including the image)
  const infoWindowContent = `
    <div>
      <p><strong>Latitude:</strong> ${location.lat}</p>
      <p><strong>Longitude:</strong> ${location.lng}</p>
      ${imagePath ? `<img src="${imagePath}" alt="Uploaded Image" style="width:100px;height:auto;">` : '<p>No image available</p>'}
    </div>
  `;

  // Create an info window with coordinates and image
  const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent
  });

  // Show info window when marker is clicked
  marker.addListener('click', () => {
      infoWindow.open(map, marker);
  });
}

window.initMap = initMap;
