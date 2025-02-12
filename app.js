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
    // console.log('a user connected', socket.id);

    socket.on('sendLocation', (data) => {
        io.emit('receiveLocation', {
            id: socket.id,
            ...data
        });
    });

    socket.on('disconnect', () => {
        io.emit('userDisconnected', socket.id);
        // console.log('user disconnected', socket.id);
    });
});

app.get('/', (req, res) => {
  res.render('index');
})

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})