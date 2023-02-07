const express = require('express');

// Controllers
const {
    addProductToCart,
    makePurcharse,
    removeProductInCart,
    updateProductInCart
} = require('../controllers/carts.controller');

// Middlewares
const { cartExists } = require('../middlewares/carts.middlewares');
const {
	protectSession,
	protectUsersAccount,
	protectAdmin
} = require('../middlewares/auth.middlewares');

const cartsRouter = express.Router();

// Protecting below endpoints
cartsRouter.use(protectSession);

cartsRouter.post('/add-product', addProductToCart);
cartsRouter.patch('/update-cart', updateProductInCart);
cartsRouter.delete('/:productId', removeProductInCart);
cartsRouter.post('/purchase', makePurcharse);

module.exports = { cartsRouter };