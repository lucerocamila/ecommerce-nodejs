const express = require('express');

// Controllers
const {
    createProduct,
    disabledProduct,
    getProduct,
    getProductsActives,
    updateProduct
} = require('../controllers/products.controller');

// Middlewares
const { productExists } = require('../middlewares/products.middlewares');
const {
	protectSession,
	protectUsersAccount,
    protectProductOwners,
	protectAdmin
} = require('../middlewares/auth.middlewares');
const {
	createProductValidators
} = require('../middlewares/validators.middlewares');

const productsRouter = express.Router();

// Utils
const { upload } = require('../utils/multer.util');

// Protecting below endpoints
productsRouter.use(protectSession);

productsRouter.post('/', upload.array('productImg', 5), createProduct);
productsRouter.get('/', getProductsActives);
productsRouter.get('/:id', productExists, getProduct);
productsRouter.patch('/:id', productExists, protectProductOwners, updateProduct);
productsRouter.delete('/:id', productExists, protectProductOwners, disabledProduct);

module.exports = { productsRouter };