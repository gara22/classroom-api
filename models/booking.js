const mongoose = require('mongoose');

const BookingSchema = mongoose.Schema({
	classroom_id: {
		type: String,
		required: true
	},
	from: {
		type: Date,
		required: true
	},
	to: {
		type: Date,
		required: true
	},
	booked_by: {
		type: {
			_id: String,
			name: String
		},
		required: true
	},
	description: {
		type: String
	}
});

const Booking = (module.exports = mongoose.model('Booking', BookingSchema));

module.exports.getBookingsOfClassroom = (classroom_id) => {
	const query = { classroom_id: classroom_id };
	// const query = {};
	return Booking.find(query);
};

module.exports.getBookingById = (booking_id) => {
	return Booking.findById(booking_id);
};

module.exports.getBookingsOfUser = (user_id, upcoming = 0) => {
	let query = { 'booked_by._id': user_id };
	if (upcoming === 1) {
		query = { 'booked_by._id': user_id, from: { $gte: Date.now() } };
		return Booking.find(query);
	}
	// const query = {};
	return Booking.find(query);
};

module.exports.getAllBookings = (upcoming = 0) => {
	if (upcoming === 1) {
		const query = { from: { $gte: Date.now() } };
		return Booking.find(query);
	}

	return Booking.find();
};

module.exports.addBooking = (newBooking) => {
	return newBooking.save();
};

module.exports.deleteBooking = (bookingId, userId, role) => {
	if (role === 'admin') {
		return Booking.deleteOne({ _id: bookingId });
	}
	return Booking.deleteOne({ _id: bookingId, 'booked_by._id': userId });
};

module.exports.isAvailable = (classroomId, fromDate, toDate) => {
	let query;
	if(classroomId){
		query = {
		classroom_id: classroomId,
		$or: [
			{ $and: [ { from: { $gt: fromDate } }, { from: { $lt: toDate } } ] },
			{ $and: [ { to: { $gt: fromDate } }, { to: { $lt: toDate } } ] },
			{ $and: [ { from: { $lte: fromDate } }, { to: { $gte: toDate } } ] }
		]
	};
	}else if(!classroomId){
		query = {
		$or: [
			{ $and: [ { from: { $gt: fromDate } }, { from: { $lt: toDate } } ] },
			{ $and: [ { to: { $gt: fromDate } }, { to: { $lt: toDate } } ] },
			{ $and: [ { from: { $lte: fromDate } }, { to: { $gte: toDate } } ] }
		]
	};
	}
	
	return Booking.find(query);
};

//EDIT - not implemented
// module.exports.editBooking = (bookingId) => {
// };
