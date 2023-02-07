// Models
const { Cart } = require('../models/cart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');

const cartExists = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const cart = await Cart.findOne({ where: { id } });

	if (!cart) {
		return next(new AppError('Cart not found', 404));
	}

	req.cart = cart;
	next();
});

module.exports = { cartExists };