const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const http = require('http');
const socket = require('socket.io');

const server = http.createServer(app);
const io = socket(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    const clientIP = socket.handshake.address; // Get user's IP address
    const userAgent = socket.handshake.headers['user-agent']; // Get user device info

    console.log(`User connected: ${socket.id}, IP: ${clientIP}, Device: ${userAgent}`);
    let locationLogged = false;
    socket.on('sendLocation', (data) => {
        if (!locationLogged) {
            const timestamp = new Date().toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit', 
                hour12: true 
            });
            console.log(`User ${socket.id} Location - Lat: ${data.latitude}, Lng: ${data.longitude}, At time: ${timestamp}`);
            locationLogged = true; 
        }

        io.emit('receiveLocation', {
            id: socket.id,
            ...data
        });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}, IP: ${clientIP}`);
        io.emit('userDisconnected', socket.id);
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});