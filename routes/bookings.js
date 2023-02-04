const express = require('express');
const router = express.Router();

const Booking = require('../models/booking');
const User = require('../models/user');
const checkAuth = require('../middleware/check-auth');
const io = require('../config/socket');

//EDIT - to be implemented... or not
// router.post('/edit', (req, res) => {
//
// });

router.delete('/delete/:id', checkAuth.checkAuth, (req, res) => {
	// console.log(req);
	let bookingData;

	const booking_id = req.params.id;
	Booking.getBookingById(booking_id)
		.then((booking) => {
			bookingData = booking;
		})
		.catch((err) => console.log(err));
	Booking.deleteBooking(booking_id, req.userData.userId, req.userData.role)
		.then((succ) => {
			if (succ.deletedCount > 0) {
				let room = bookingData.classroom_id;
				console.log(room);

				io.getIO().in(room).emit('bookingOperation', { action: 'delete', booking: booking_id });

				res.status(200).json({ success: true, msg: 'Booking deleted' });
			} else {
				res.status(400).json({ success: false, msg: 'Failed to delete booking' });
			}
		})
		.catch((err) => console.log(err));
	// .then((succ) => res.status(200).json({ success: true, msg: 'Booking deleted' }))
	// .catch((err) => res.status(400).json({ success: false, msg: 'Failed to delete booking' }));
});
router.post('/:id', checkAuth.checkAuth, (req, res) => {
	let from_date = new Date(req.body.from);
	let to_date = new Date(req.body.to);
	let classroom_id = req.params.id;
	let description = req.body.description;
	let user = req.userData;
	if (from_date >= to_date) {
		return res.json({
			success: false,
			msg: 'From date must be less than to date! Failed to add booknig'
		});
	}

	Promise.all([ User.getUserById(user.userId), Booking.isAvailable(classroom_id, from_date, to_date) ])
		.then((val) => {
			if (val[0] && val[1].length === 0) {
				const newBooking = new Booking({
					classroom_id: req.params.id,
					from: from_date,
					to: to_date,
					booked_by: {
						_id: user.userId,
						name: user.name
					},
					description: description
				});

				return Booking.addBooking(newBooking);
			} else {
				res.status(400).json({
					success: false,
					msg: "Couldn't add booking"
				});
				return Promise.reject('ASDASD');
			}
		})
		.then((newBooking) => {
			if (newBooking) {
				let room = newBooking.classroom_id;
				io.getIO().in(room).emit('bookingOperation', { action: 'add', booking: newBooking });

				return res.status(201).json({
					success: true,
					msg: 'Booking added, gucci'
				});
			} else {
				return res.status(400).json({
					success: false,
					msg: 'god damn'
				});
			}
		})
		.catch((err) => {
			console.log(err);
		});
});

router.get('/classrooms/:id', async (req, res) => {
	const classroom_id = req.params.id;

	try {
		let bookings = await Booking.getBookingsOfClassroom(classroom_id);
		if (bookings.length === 0) {
			res.json([]);
		} else {
			res.json(bookings);
		}
	} catch (err) {
		throw err;
	}

	// Booking.getAllBookings(classroom_id)
	// 	.then((bookings) => {
	// 		console.log(bookings);

	// 		if (bookings.length === 0) {
	// 			res.json({ success: false, msg: 'Bookings not found' });
	// 		} else {
	// 			res.json({ bookings });
	// 		}
	// 	})
	// 	.catch((err) => {
	// 		throw err;
	// 	});
});

router.get('/users/:id', [ checkAuth.checkAuth ], (req, res) => {
	const pageSize = +req.query.pageSize;
	const currentPage = +req.query.page;
	const upcoming = +req.query.upcoming;
	const user_id = req.params.id;
	let query = Booking.getBookingsOfUser(user_id, upcoming);
	let fetchedBookings;

	if (pageSize && currentPage) {
		query = Booking.getBookingsOfUser(user_id, upcoming).skip(pageSize * (currentPage - 1)).limit(pageSize);
	}
	query
		.then((bookings) => {
			fetchedBookings = bookings;
			if (upcoming === 1) {
				return Booking.count({ 'booked_by._id': user_id, from: { $gte: Date.now() } });
			}
			return Booking.count({ 'booked_by._id': user_id });
		})
		.then((count) => {
			res.status(200).json({
				bookings: fetchedBookings,
				maxBookings: count
			});
		})
		.catch((err) =>
			res.status(400).json({
				msg: err
			})
		);
});

router.get('/all',
  //  [ checkAuth.checkAuth, checkAuth.checkAdmin ],
  (req, res) => {
	const pageSize = +req.query.pageSize;
	const currentPage = +req.query.page;
	const upcoming = +req.query.upcoming;
	let query = Booking.getAllBookings(upcoming);
	let fetchedBookings;
	if (pageSize && currentPage) {
		query = Booking.getAllBookings(upcoming).skip(pageSize * (currentPage - 1)).limit(pageSize);
	}
	query
		.then((bookings) => {
			fetchedBookings = bookings;
			if (upcoming === 1) {
				return Booking.count({ from: { $gte: Date.now() } });
			}
			return Booking.count();
		})
		.then((count) => {
			res.status(200).json({
				bookings: fetchedBookings,
				maxBookings: count
			});
		})
		.catch((err) =>
			res.status(400).json({
				msg: err
			})
		);
});

module.exports = router;
