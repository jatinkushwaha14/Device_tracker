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

    socket.on('sendLocation', (data) => {
        // console.log(`Location from ${socket.id} (IP: ${clientIP}, Device: ${userAgent}):`, data);

        io.emit('receiveLocation', {
            id: socket.id,
            ...data
        });
    });

    // socket.on('disconnect', () => {
    //     console.log(`User disconnected: ${socket.id}, IP: ${clientIP}`);
        io.emit('userDisconnected', socket.id);
    });
});

app.get('/', (req, res) => {
    res.render('index');
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});