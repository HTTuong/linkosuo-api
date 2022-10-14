const mongoose = require('mongoose');

const DESCRIPTIONS = {
    cakes: [
        "Linkosuo's spectacular and delicious cakes crown the festive table. Choose the right cake for your party from our delicious selection.",

        'Please note that our online store products have an order time of 3 business days. You can pick up your order from our cafe or restaurant of your choice.',

        'We reserve the right to make changes to the cakes and the decorations may change seasonally.',
    ],
    pies: [
        "In our pies, you will always find a seasonal pie, which is made from the season's best ingredients. In addition to the pie of the season, the selection includes tasty wholes both for dessert and as part of the festive table.",

        'Please note that our online store products have an order  time of 3  business days. You can pick up your order from our cafe or restaurant of your choice.',
    ],
    'coffee-cakes-and-buns': [
        'Delicious Linkoso coffee cakes and buns to serve on the coffee table or as an addition to the party table.',

        'Please note that our online store products have an order  time of 3  business days. You can pick up your order from our cafe or restaurant of your choice.',
    ],
    salads: [
        'In our salad selection, you can find various tasty combinations.',

        'Please note that our online store  products currently have an order time of  3 business days. You can pick up your order from our cafe or restaurant of your choice.',
    ],
    'sandwich-cakes': [
        'Linkosuo sandwich cakes are real classics. Traditional and tasty sandwich cakes always work well as part of the festive table.',

        'Please note that our online store products have an order  time of 3  business days. You can pick up your order from our cafe or restaurant of your choice.',
    ],
    'round-roasts': [
        'Three juicy salty roasts are the latest additions to our online store.',

        'Please note that our online store  products currently have an order time of  3 business days. You can pick up your order from our cafe or restaurant of your choice.',
    ],
    'omelet-rolls': [
        "Linkosuo's omelet rolls are our traditional order products, which can be found on several party tables. Delicious omelet rolls are also suitable for serving on weekdays.",

        'Please note that our online store products have an order time of 3  business days. You can pick up your order from our cafe or restaurant of your choice.',
    ],

    'all-products': [
        'We have added our cake selection and some of our order products to our online store.',

        'Please note that our online store products have an order  time of 3  business days. You can pick up your order from our cafe or restaurant of your choice.',
    ],
    event: [
        'In our selection, you can find sandwiches and party cakes for every taste. Our pastry shop makes the cakes by hand in our pastry shop in Kangasa.',

        'Now you can also buy a graduation cap from our online store to decorate your cake. The decoration is delivered in its own packaging with your order.',
    ],
};

const filterProducts = async (filterObject) => {
    try {
        const collection = mongoose.connection.db.collection('products');
        const isCorrectCollection = collection.namespace.split('.')[1] === 'products';
        if (!isCorrectCollection) {
            const error = new Error('Failed to connect collection');
            error.statusCode = 500;
            throw error;
        }
        const products = await collection.find(filterObject).toArray();
        if (products.length === 0) {
            const error = new Error('Products not found');
            error.statusCode = 404;
            throw error;
        }

        return products;
    } catch (error) {
        throw error;
    }
};

const generateMenu = (productsOfPage) => {
    let menu = [];
    productsOfPage.forEach((product) => {
        product.diet.forEach((diet) => {
            if (!menu.includes(diet)) {
                menu.push(diet);
            }
        });
    });
    menu.sort();
    return menu;
};

const generateTitle = (title) => {
    if (title.includes('-')) {
        return title.split('-').join(' ');
    }
    return title;
};

// Generic controllers
exports.getProductsByDiet = async (req, res, next) => {
    let segment = req.params.filter; // /sweet/lactose-free
    const diet = req.params.diet;
    let filterDiet = {};
    let filterObject = { diet: diet };

    if (segment.includes('sweet') || segment.includes('salty') || segment.includes('sauce')) {
        filterObject.type = segment;
        filterDiet.type = segment;
    } else if (segment.includes('all-products')) {
        filterObject.diet = diet;
    } else if (segment.includes('event')) {
        filterObject.event = true;
        filterDiet.event = true;
    } else {
        filterObject.subtype = segment;
        filterDiet.subtype = segment;
    }

    let title = generateTitle(segment);
    if (segment === 'event') {
        title = 'Spring and summer parties';
    }
    let description = DESCRIPTIONS[segment];

    try {
        const productsMakeDiet = await filterProducts(filterDiet);
        const products = await filterProducts(filterObject);
        const menu = generateMenu(productsMakeDiet);
        res.status(200).json({
            message: 'Fetching products successfully',
            products: products,
            menu: menu,
            title: title,
            description: description,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

// Get a specific product
exports.getProduct = async (req, res, next) => {
    const filter = req.params.filter;
    const prodId = req.params.productId;
    let filterObject = { _id: mongoose.Types.ObjectId(prodId) };

    try {
        const product = await filterProducts(filterObject);
        if (filter === product[0].type || filter === product[0].subtype || filter === 'all-products') {
            res.status(200).json({ message: 'Fetching product successfully', product: product[0] });
        } else {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};

exports.getProducts = async (req, res, next) => {
    const filter = req.params.filter; // /sweet or /sauces-and-spices or /event
    let products;
    let description = DESCRIPTIONS[filter];

    try {
        if (filter === 'all-products') {
            products = await filterProducts();
            description = DESCRIPTIONS['all-products'];
        } else if (filter === 'sweet' || filter === 'salty' || filter === 'sauces-and-spices') {
            products = await filterProducts({ type: filter });
        } else if (filter === 'event') {
            products = await filterProducts({ event: true });
        } else {
            products = await filterProducts({ subtype: filter });
        }
        const menu = generateMenu(products);
        let title = generateTitle(filter); // convert 'sauces-and-spices' to 'sauces and spices'
        if (filter === 'event') {
            title = 'Spring and summer parties';
        }
        res.status(200).json({
            message: 'Fetching products successfully',
            products: products,
            menu: menu,
            title: title,
            description: description,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};
