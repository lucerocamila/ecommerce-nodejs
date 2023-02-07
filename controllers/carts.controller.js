const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Models
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

dotenv.config({ path: './config.env' });

const addProductToCart = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;
    const { productId, quantity } = req.body;

    // search if user have some cart active
    const cart = await Cart.findOne({
        where: {
            userId: sessionUser.id,
            status: 'active'
        }
    });

    // search product
    const product = await Product.findOne({ where: { id: productId } });

    // if product not exists
    if (!product) {
		return next(new AppError('Product not found', 404));
	}

    // ¿exceed limit of stock?
    if (product.quantity < quantity) {
        return next(new AppError('Product limit exceeded', 400));
    }

    // search product active in cart
    const productInCart = await ProductInCart.findOne({
        where: {
            productId,
            status: 'active'
        }
    });

    // search product removed in cart
    const productInCartRemoved = await ProductInCart.findOne({
        where: {
            productId,
            status: 'removed'
        }
    });

    // cart active exists in cart
    if (productInCart) {
        return next(new AppError('Product is in the cart', 400));
    }
    
    // cart removed exists in cart
    if (productInCartRemoved) {
        await productInCartRemoved.update({ status: 'active' });
    }
    
    // If cart doesn't exist, create
	if (!cart) {
        const newCart = await Cart.create({ userId: sessionUser.id })

        const newProductInCart = await ProductInCart.create({
            cartId: newCart.id,
            productId,
            quantity
        });

        // 201 -> Success and a resource has been created
        return res.status(201).json({
            status: 'success',
            data: { newProductInCart }
        });
    }

    // if it have an cart active..
    const newProductInCart = await ProductInCart.create({
        cartId: cart.id,
        productId,
        quantity
	});

    // 201 -> Success and a resource has been created
	res.status(201).json({
		status: 'success',
		data: { newProductInCart }
	});
});

const updateProductInCart = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;
    const { productId, newQty } = req.body;

    // search if user have some cart active
    const cart = await Cart.findOne({
        where: {
            userId: sessionUser.id,
            status: 'active'
        }
    });

    // if not have cart actives
    if (!cart) {
        return next(new AppError('the user not have cart active', 400));
    }

    // search product active in cart
    const productInCart = await ProductInCart.findOne({
        where: {
            productId,
            status: 'active'
        }
    });

    // if not have cart actives
    if (!productInCart) {
        return next(new AppError('the product not exists in a cart active', 400));
    }

    if (newQty == 0) {
        await productInCart.update({ quantity: newQty, status: 'removed' });
    } else {
        await productInCart.update({ quantity: newQty, status: 'active' });
    }

    // search product, for know if have stock required
    const product = await Product.findOne({ where: { id: productId } });

    // ¿exceed limit of stock?
    if (product.quantity < newQty) {
        return next(new AppError('Product limit exceeded', 400));
    }

    // response
	res.status(200).json({
		status: 'success',
		data: { productInCart },
	});
});

const removeProductInCart = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    // search product active in cart
    const productInCart = await ProductInCart.findOne({
        where: {
            productId,
            status: 'active'
        }
    });

    // if not have product active
    if (!productInCart) {
        return next(new AppError('the product not have in cart', 400));
    }

    await productInCart.update({ quantity: 0, status: 'removed' });

    res.status(204).json({ status: 'success' });
});

const makePurcharse = catchAsync(async (req, res, next) => {
    const { sessionUser } = req;

    // search if user have some cart active
    const cart = await Cart.findOne({
        where: {
            userId: sessionUser.id,
            status: 'active'
        },
        include: {
            model: ProductInCart,
            where: { status: 'active' }
        }
    });

    // if not have cart actives
    if (!cart) {
        return next(new AppError('the user not have cart active', 400));
    }

    const productInCart = await ProductInCart.findAll({
        where: {
            cartId: cart.id,
            status: 'active'
        }
    })

    var total = 0;
    productInCart.map(async item => {
        // search each product
        const product = await Product.findOne({ where: { id: item.productId } })

        // calc subtotal for each product
        const subtotal = item.quantity * product.price;

        // acumulate total price of cart
        total += subtotal;

        // if limit exceeded..
        if (product.quantity < item.quantity) return next(new AppError('Product limit exceeded', 400));

        // if not limit exceeded
        const remainingQty = product.quantity - item.quantity;

        // update quantity to product
        await product.update({ quantity: remainingQty });

        // mark product as 'purchased' in the cart
        await item.update({ status: 'purchased' });
    })
    
    // mark cart as 'purchased'
    await cart.update({ status: 'purchased' });

    // create order
    const newOrder = await Order.create({
        userId: sessionUser.id,
        cartId: cart.id,
        totalPrice: total
	});

    // 201 -> Success and a resource has been created
	res.status(201).json({
		status: 'success',
		data: { newOrder },
	});
});

module.exports = {
    addProductToCart,
    updateProductInCart,
    removeProductInCart,
    makePurcharse
};