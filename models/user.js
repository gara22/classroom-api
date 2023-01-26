const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
	name: {
		type: String
	},
	email: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		required: true
	}
});

const User = (module.exports = mongoose.model('User', UserSchema));

module.exports.addUser = function(newUser, cb) {
	bcrypt.genSalt(10, (_err, salt) => {
		bcrypt.hash(newUser.password, salt, (_err, hash) => {
			newUser.password = hash;
			newUser.save(cb);
		});
	});
};

module.exports.getUserById = (id) => {
	return User.findById(id);
};

module.exports.getUserByUsername = (username) => {
	const query = { username: username };
	return User.findOne(query);
};

module.exports.comparePassword = (candidatePassword, hash) => {
	return bcrypt.compare(candidatePassword, hash);
};
