const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const collectionsRoutes = require('./routes/collections');
const storeRoutes = require('./routes/store');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');
const cors = require('cors');
const config = require('./constants.d');
app.set('view engine', 'ejs');
app.set('views', 'views');

const corsOptions = {
    origin: '*',
    methods: ['GET, POST, PUT, DELETE, PATCH'],
    allowedHeaders: ['Content-Type, Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use(express.static(__dirname + 'assets'));

app.use('/linkosuo-ui/collections', collectionsRoutes);
app.use('/linkosuo-ui/account', authRoutes);
app.use('/linkosuo-ui/checkout', orderRoutes);
app.use(storeRoutes);

app.use((error, req, res, next) => {
    console.log('Error here: ', error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message, error: error });
});

const dotenv = require('dotenv');
const { resourceUsage } = require('process');

dotenv.config({ path: './.env' });

mongoose
    .connect(process.env.DATABASE)
    .then(() => {
        app.listen(process.env.PORT);
    })
    .catch((error) => {
        console.log(error);
    });

process.on('SIGTERM', () => {
    console.log('hello SIGTERM');
    app.listen(3000).close(() => {
        console.log('Process terminated!');
    });
});
