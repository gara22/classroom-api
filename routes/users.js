const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');

const User = require('../models/user');

//Register
router.post('/register', (req, res, next) => {
	let newUser = new User({
		name: req.body.name,
		email: req.body.email,
		username: req.body.username,
		password: req.body.password,
		role: req.body.role
	});

	User.addUser(newUser, (err, user) => {
		if (err) {
			res.json({ success: false, msg: 'Failed to register user' });
		} else {
			res.json({ success: true, msg: 'User registered' });
		}
	});
});

//TODO: test this
router.post('/auth', (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;
	let futureUser;

	User.getUserByUsername(username)
		.then((user) => {
			if (!user) {
				res.status(401).json({
					success: false,
					msg: 'User not found'
				});
				return Promise.reject('NOT FOUND');
			}
			futureUser = user;
			return User.comparePassword(password, user.password);
		})
		.then((result) => {
			if (!result) {
				return res.status(401).json({
					success: false,
					msg: 'Wrong password'
				});
			}
			const token = jwt.sign(
				{
					email: futureUser.email,
					userId: futureUser._id,
					name: futureUser.name,
					role: futureUser.role,
					username: futureUser.username
				},
				config.secret,
				{
					expiresIn: '1h'
				}
			);
			res.status(200).json({
				token: token,
				expiresIn: 3600,
				user: futureUser
			});
		})
		.catch((err) => {
			console.log(err);
		});
});

router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res, next) => {
	// console.log(req.user);
	res.json({ user: req.user });
});

// router.get('/validate', (req, res, next) => {
// 	res.send('validate');
// });

module.exports = router;
