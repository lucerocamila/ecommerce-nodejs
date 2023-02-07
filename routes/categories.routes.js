const express = require('express');

// Controllers
const {
    createCategory,
    getCategoriesActives,
    updateCategory
} = require('../controllers/products.controller');

// Middlewares
const { categoryExists } = require('../middlewares/categories.middlewares');
const {
	protectSession,
	protectUsersAccount,
	protectAdmin
} = require('../middlewares/auth.middlewares');

const categoriesRouter = express.Router();


// Protecting below endpoints
categoriesRouter.use(protectSession);

categoriesRouter.get('/', getCategoriesActives);
categoriesRouter.post('/', createCategory);
categoriesRouter.patch('/:id', categoryExists, updateCategory);

module.exports = { categoriesRouter };