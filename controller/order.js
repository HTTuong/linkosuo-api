const Order = require('../models/order');
const User = require('../models/user');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const rootDir = require('path').resolve('./');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hoangthetuong2001@gmail.com',
        pass: 'saodcckvyvbuupxs', // App password
    },
});

exports.handleUnknownUserOrder = async (req, res, next) => {
    const products = req.body.order.products;
    const productsInOrder = products.map((product) => ({
        productId: mongoose.Types.ObjectId(product._id),
        name: product.name,
        image: product.image,
        price: product.price,
        amount: product.amount,
    }));

    const order = new Order({
        ...req.body,
        order: {
            products: productsInOrder,
            total_price: req.body.order.total_price,
        },
    });

    try {
        const result = await order.save();
        res.status(201).json({
            message: 'Order successfully',
            orderId: result._id.toString(),
            pickup_info: result.pickup_info,
            email: result.email,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.handleUserOrder = async (req, res, next) => {
    const products = req.body.order.products;
    const productsInOrder = products.map((product) => ({
        productId: mongoose.Types.ObjectId(product._id),
        name: product.name,
        image: product.image,
        price: product.price,
        amount: product.amount,
    }));

    const order = new Order({
        ...req.body,
        userId: req.userId,
        order: {
            products: productsInOrder,
            total_price: req.body.order.total_price,
        },
    });

    try {
        const result = await order.save();
        res.status(201).json({
            message: 'Order successfully',
            orderId: result._id.toString(),
            pickup_info: result.pickup_info,
            email: result.email,
            userId: req.userId,
        });

        const dataTemplate = await ejs.renderFile(rootDir + '/views/order.ejs', {
            products: result.order.products,
            total_price: result.order.total_price,
        });

        transporter.sendMail({
            to: result.email,
            from: 'hoangthetuong2001@gmail.com',
            subject: 'Order successfully !',
            html: dataTemplate,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.getOrders = async (req, res, next) => {
    const userId = req.userId;

    try {
        const orders = await Order.find({ userId: mongoose.Types.ObjectId(userId) });
        const user = await User.findById(userId);
        const ordersOfUser = orders.map((order) => {
            return {
                orderId: order._id.toString(),
                total_price: order.order.total_price,
                products: order.order.products,
                pickup_info: order.pickup_info,
                orderAt: order.createdAt,
            };
        });
        res.status(200).json({
            message: 'Fetching orders successfully',
            orders: ordersOfUser,
            username: user.fullname,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
