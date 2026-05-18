const express = require('express');
const cors = require('cors');
const pool = require('./config/dbConfig');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on("connection", (socket) => {
    console.log("Un cliente se ha conectado:", socket.id);
    socket.on("disconnect", () => {
        console.log("Un cliente se ha desconectado:", socket.id);
    });
});

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.send('¡Servidor backend funcionando!');
});

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const documentRoutes = require('./routes/documents.routes');
app.use('/api', authRoutes);
app.use('/users', userRoutes);
app.use('/documents', documentRoutes);