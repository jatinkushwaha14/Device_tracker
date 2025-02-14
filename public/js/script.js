const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('sendLocation', { latitude, longitude });
    }, (error) => {
        console.log(error);
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
}

const map = L.map("map").setView([0, 0], 2); // Set initial zoom level to 2 for a global view
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© JK'
}).addTo(map);

const markers = {};
const paths = {}; // Store polyline paths for each user

socket.on('receiveLocation', (data) => {
    const { id, latitude, longitude } = data;
    console.log(`Received location for user ${id}: ${latitude}, ${longitude}`);

    if (!markers[id]) {
        // Create a marker
        markers[id] = L.marker([latitude, longitude]).addTo(map);

        // Initialize path array
        paths[id] = [];
        
        // Create polyline for tracking
        paths[id].polyline = L.polyline([], { color: 'blue', weight: 3 }).addTo(map);
    }

    // Update marker position
    markers[id].setLatLng([latitude, longitude]);

    // Add new position to path and update polyline
    paths[id].push([latitude, longitude]);
    paths[id].polyline.setLatLngs(paths[id]);

    // Center on first user
    if (Object.keys(markers).length === 1) {
        map.setView([latitude, longitude], 20);
    }
});

socket.on('userDisconnected', (id) => {
    console.log(`User ${id} disconnected`);

    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
    
    if (paths[id]) {
        map.removeLayer(paths[id].polyline); // Remove the polyline
        delete paths[id];
    }
});