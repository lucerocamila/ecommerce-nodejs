const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Models
const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');
const { uploadProductImgs, getProductsImgsUrls } = require('../utils/firebase.util');

dotenv.config({ path: './config.env' });

const createProduct = catchAsync(async (req, res, next) => {
	const { title, description, price, categoryId, quantity } = req.body;
	const { sessionUser } = req;

    // search category
	const category = await Category.findOne({ where: { id: categoryId } });

    // if the category not exists..
	if (!category) {
		return next(new AppError('Category not found', 404));
	}

    // if the category exists, continue..
    const newProduct = await Product.create({
		title,
		description,
        price,
        categoryId,
        quantity,
		userId: sessionUser.id,
	});

	await uploadProductImgs(req.files, newProduct.id);

	res.status(201).json({
		status: 'success',
		data: { newProduct },
	});
});

const getProductsActives = catchAsync(async (req, res, next) => {
	const products = await Product.findAll({ where: { status: 'active' } });

	res.status(200).json({
		status: 'success',
		data: { products },
	});
});

const getProduct = catchAsync(async (req, res, next) => {
	const { product } = req;

	res.status(200).json({
		status: 'success',
		data: { product },
	});
});

const updateProduct = catchAsync(async (req, res, next) => {
	const { title, description, price, quantity } = req.body;
	const { product } = req;

	// Method 2: Update using a model's instance
	await product.update({ title, description, price, quantity });

	res.status(200).json({
		status: 'success',
		data: { product },
	});
});

const disabledProduct = catchAsync(async (req, res, next) => {
	const { product } = req;

	// Method 3: Soft delete
	await product.update({ status: 'disabled' });

	res.status(204).json({ status: 'success' });
});

const getCategoriesActives = catchAsync(async (req, res, next) => {
	const categories = await Category.findAll({ where: { status: 'active' } });

	res.status(200).json({
		status: 'success',
		data: { categories },
	});
});

const createCategory = catchAsync(async (req, res, next) => {
	const { name } = req.body;

	const newCategory = await Category.create({ name });

	res.status(201).json({
		status: 'success',
		data: { newCategory },
	});
});

const updateCategory = catchAsync(async (req, res, next) => {
	const { name } = req.body;
	const { category } = req;

	// Method 2: Update using a model's instance
	await category.update({ name });

	res.status(200).json({
		status: 'success',
		data: { category },
	});
});

module.exports = {
	createProduct,
	getProductsActives,
	getProduct,
	updateProduct,
	disabledProduct,
	getCategoriesActives,
	createCategory,
    updateCategory
};