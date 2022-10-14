const express = require('express');
const router = express.Router();
const storeController = require('../controller/store');

// /linkosuo-ui
router.get('/linkosuo-ui', storeController.getProducts);

module.exports = router;
