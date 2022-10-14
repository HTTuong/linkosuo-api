const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
        email: {
            type: String,
            required: true,
        },
        fullname: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        user_address: {
            type: String,
            required: true,
        },
        phone_number: {
            type: String,
            required: true,
        },
        pickup_info: {
            pickup_address: {
                type: String,
                required: true,
            },
            pickup_date: {
                type: String,
                required: true,
            },
        },
        order: {
            products: [
                {
                    productId: {
                        type: mongoose.Types.ObjectId,
                        required: true,
                    },
                    name: {
                        type: String,
                        required: true,
                    },
                    image: {
                        type: String,
                        required: true,
                    },
                    price: {
                        type: String,
                        required: true,
                    },
                    amount: {
                        type: Number,
                        required: true,
                    },
                },
            ],
            total_price: {
                type: Number,
                required: true,
            },
        },
        payment_info: {
            card_number: {
                type: String,
                required: true,
            },
            expiration_date: {
                type: String,
                required: true,
            },
            cvv: {
                type: Number,
                required: true,
            },
            holder_name_name: {
                type: String,
                required: true,
            },
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Order', orderSchema);
