const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        fullname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        cart: {
            totalPrice: {
                type: Number,
                required: true,
            },
            products: [
                {
                    type: mongoose.Types.ObjectId,
                    required: true,
                    ref: 'Product',
                },
            ],
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('User', userSchema);
