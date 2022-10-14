const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const fs = require('fs');
const { validationResult } = require('express-validator');
const rootDir = require('path').resolve('./');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hoangthetuong2001@gmail.com',
        pass: 'saodcckvyvbuupxs', // App password
    },
});

exports.signup = async (req, res, next) => {
    const lastName = req.body.lastname;
    const firstName = req.body.firstname;
    const email = req.body.email;
    const password = req.body.password;
    const fullname = firstName + ' ' + lastName;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.message = errors.errors[0].msg;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            fullname: fullname,
            email: email,
            password: hashedPassword,
            cart: {
                totalPrice: 0,
                products: [],
            },
        });
        const result = await newUser.save();
        res.status(201).json({
            message: 'Creating a new user successfully',
            user: { email: email, name: fullname, userId: result._id },
        });

        const dataTemplate = await ejs.renderFile(rootDir + '/views/signup.ejs', { username: fullname });

        transporter.sendMail({
            to: email,
            from: 'hoangthetuong2001@gmail.com',
            subject: 'Sign up successfully !',
            html: dataTemplate,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed');
            error.statusCode = 422;
            error.message = errors.errors[0].msg;
            throw error;
        }

        const user = await User.findOne({ email: email });
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            const error = new Error('Wrong password. Try again or click Forgot your password to reset it');
            error.statusCode = 422;
            throw error;
        }
        const token = jwt.sign({ email: email, userId: user._id.toString() }, 'somesecret', { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successfully', userId: user._id.toString(), token: token });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.generateToken = async (req, res, next) => {
    const oldToken = req.get('Authorization').split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.decode(oldToken, 'somesecret');
    } catch (error) {
        error = new Error('Unable to decode the token to generate a new one');
        error.statusCode = 401;
        throw error;
    }

    const newToken = jwt.sign({ email: decodedToken.email, userId: req.userId }, 'somesecret', { expiresIn: '1h' });
    res.status(200).json({ message: 'A new token was generated successfully', userId: req.userId, token: newToken });
};

exports.validateToken = async (req, res, next) => {
    const currentToken = req.get('Authorization').split(' ')[1];
    jwt.verify(currentToken, 'somesecret', (error, decoded) => {
        if (error) {
            res.status(200).json({
                message: 'Session expired. Please login again',
                expiresAt: error.expiredAt,
            });
        }
    });
};

exports.getProfile = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('Something went wrong with the server.');
            error.statusCode = 500;
            throw error;
        }

        res.status(200).json({
            message: 'Fetching user information successfully',
            userInfo: { email: user.email, fullname: user.fullname },
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.checkEmailResetPassword = async (req, res, next) => {
    const email = req.body.email;
    const errors = validationResult(req);

    try {
        if (!errors.isEmpty()) {
            const error = new Error('No account associated with this email address');
            error.statusCode = 422;
            throw error;
        }
        const user = await User.findOne({ email: email });
        res.status(200).json({ message: 'Email accepted', email: email, id: user._id.toString() });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    const userId = req.params.userId;
    const new_password = req.body.password;

    try {
        const user = await User.findById(userId);
        const hashedPassword = await bcrypt.hash(new_password, 12);
        user.password = hashedPassword;
        const result = await user.save();
        res.status(200).json({ message: 'Change password successfully', email: result.email });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
