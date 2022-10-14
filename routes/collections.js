const express = require('express');
const router = express.Router();
const collectionsController = require('../controller/collections');

// /collections/...

// get products by filter
router.get('/:filter', collectionsController.getProducts);

// get products by diet
router.get('/:filter/:diet', collectionsController.getProductsByDiet);

// get a product
router.get('/:filter/products/:productId', collectionsController.getProduct);

module.exports = router;
