const jwt = require('jsonwebtoken');
const config = require('../config/database');

module.exports.checkAuth = (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1];
		const decodedToken = jwt.verify(token, config.secret);
		req.userData = { userId: decodedToken.userId, name: decodedToken.name, role: decodedToken.role };
		next();
	} catch (err) {
		res.status(401).json({ success: false, msg: 'Auth failed' });
	}
};

module.exports.checkAdmin = (req, res, next) => {
	try {
		const role = req.userData.role;
		if (role === 'admin') {
			next();
		} else {
			res.status(401).json({ success: false, msg: err });
		}
	} catch (err) {
		res.status(401).json({ success: false, msg: err });
	}
};
