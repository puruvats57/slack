const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require("./src/routes");
const cookieParser = require('cookie-parser');
const http = require('http');
const initializeSocket = require('./src/socket');

const initializeKafkaConsumer = require('./src/kafkaConsumer');
const Redis = require('ioredis');
const { Kafka } = require('kafkajs')
const redis = new Redis();

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});


dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("MongoDB connected...");
    })
    .catch((err) => console.error(err.message));

// Routes
app.use("/api/v1", routes);



const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
})

// Initialize Socket.IO
const io = initializeSocket(server, { cors: corsOptions }, redis, kafka);
const consumer = initializeKafkaConsumer();




app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

// Start the server
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
