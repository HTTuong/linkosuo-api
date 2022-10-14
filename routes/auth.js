const express = require('express');
const router = express.Router();
const authController = require('../controller/auth');
const { body } = require('express-validator');
const User = require('../models/user');
const isAuthenticated = require('../middleware/is-auth');

// /linkosuo-ui/account

router.post(
    '/register',
    [
        body('lastname').trim().not().isEmpty().withMessage('Invalid last name'),
        body('firstname').trim().not().isEmpty().withMessage('Invalid first name'),
        body('email')
            .isEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then((user) => {
                    if (user) {
                        return Promise.reject(
                            'This email address is already associated with a customer account. If this account is yours, you can change the password.',
                        );
                    }
                });
            }),
        body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    authController.signup,
);

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then((user) => {
                    if (!user) {
                        return Promise.reject('No account associated with this email address');
                    }
                });
            }),
        body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    authController.login,
);

router.get('/jwt', isAuthenticated, authController.generateToken);

router.get('/validate-jwt', isAuthenticated, authController.validateToken);

router.get('/profile', isAuthenticated, authController.getProfile);

router.post(
    '/forgot-password',
    body('email', 'No account associated with this email address.')
        .trim()
        .isEmail()
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then((user) => {
                if (!user) {
                    return Promise.reject('No account associated with this email address');
                }
            });
        }),
    authController.checkEmailResetPassword,
);

router.post('/change-password/:userId', authController.resetPassword);

module.exports = router;
