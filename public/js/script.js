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
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markers = {};

socket.on('receiveLocation', (data) => {
    const { id, latitude, longitude } = data;
    console.log(`Received location for user ${id}: ${latitude}, ${longitude}`);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
    // Optionally, you can center the map on the first user's location
    if (Object.keys(markers).length === 1) {
        map.setView([latitude, longitude], 20); // Adjust zoom level as needed
    }
});

socket.on('userDisconnected', (id) => {
    console.log(`User ${id} disconnected`);
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});