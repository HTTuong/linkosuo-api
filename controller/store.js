const mongoose = require('mongoose');

exports.getProducts = async (req, res, next) => {
    const collection = mongoose.connection.db.collection('products');
    try {
        const products = await collection.find().toArray();
        if (!products) {
            const error = new Error('Products not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'Fetching products successfully', products: products });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
