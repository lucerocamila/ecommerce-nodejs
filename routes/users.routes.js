const express = require('express');

// Controllers
const {
	createUser,
	detailsAnOrder,
	disabledAccount,
	getMyBuys,
	getMyProducts,
	login,
	updateProfile
} = require('../controllers/users.controller');

// Middlewares
const { userExists } = require('../middlewares/users.middlewares');
const { orderExists } = require('../middlewares/orders.middlewares');
const {
	protectSession,
	protectUsersAccount,
	protectOrderOwners,
	protectAdmin
} = require('../middlewares/auth.middlewares');
const {
	createUserValidators
} = require('../middlewares/validators.middlewares');

const usersRouter = express.Router();

usersRouter.post('/', createUserValidators, createUser);
usersRouter.post('/login', login);

// Protecting below endpoints
usersRouter.use(protectSession);

usersRouter.get('/me', getMyProducts);
usersRouter.patch('/:id', userExists, protectUsersAccount, updateProfile);
usersRouter.delete('/:id', userExists, protectUsersAccount, disabledAccount);
usersRouter.get('/orders', getMyBuys);
usersRouter.get('/orders/:id', orderExists, protectOrderOwners, detailsAnOrder);

module.exports = { usersRouter };