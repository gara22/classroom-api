const express = require('express');
const router = express.Router();

const Booking = require('../models/booking')

const Classroom = require('../models/classroom');

router.post('/find', (req, res) =>{
	const fromDate = new Date(req.body.start);
	const toDate = new Date(req.body.end)
	const hasComputers = req.body.hasComputers


	Booking.isAvailable(null, fromDate, toDate).then(bookings => {
		let ids = []
		bookings.forEach(booking => ids.push(booking.classroom_id))

		return Classroom.findFreeClassrooms(ids,hasComputers)
		
		
	}).then(classrooms => {
		res.json(classrooms)	
	}).catch(err => console.log(err))
	
	
	//  res.send(params)
	
})

router.post('/add', (req, res) => {
	const classroom = new Classroom({
		name: req.body.name,
		capacity: req.body.capacity,
		hasComputers: req.body.hasComputers
	});
	Classroom.addClassroom(classroom)
		.then((succ) => {
			if (succ) {
				res.json({
					success: true,
					msg: 'Classroom added, gucci'
				});
			}
		})
		.catch((err) => {
			if (err) {
				res.json({
					success: false,
					msg: 'Failed to add classroom'
				});
			}
		});
});
router.get('/:id', (req, res) => {
	const classroom_id = req.params.id;
	Classroom.getClassroomById(classroom_id)
		.then((classroom) => {
			if (!classroom) {
				res.json(null);
			}
			if (classroom) {
				res.json(classroom);
			}
		})
		.catch((err) => {
			throw err;
		});
});



router.get('/', (req, res) => {
	Classroom.getAllClassrooms()
		.then((classrooms) => {
			if (!classrooms) {
				res.json(null);
			} else {
				res.json(classrooms);
			}
		})
		.catch((err) => {
			throw err;
		});
});



module.exports = router;
