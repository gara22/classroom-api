const mongoose = require('mongoose');

const ClassroomSchema = mongoose.Schema({
	name: {
		type: String
	},
	capacity: {
		type: Number,
		required: true
	},
	hasComputers: {
		type: Boolean,
		required: true
	}
});

const Classroom = (module.exports = mongoose.model('Classroom', ClassroomSchema));

module.exports.getAllClassrooms = () => {
	return Classroom.find({});
};

module.exports.addClassroom = (newClassroom) => {
	return newClassroom.save();
};

module.exports.getClassroomById = (id) => {
	if (mongoose.Types.ObjectId.isValid(id)) {
		return Classroom.findById(id);
	} else {
		return Classroom.findById(null);
	}
};

module.exports.findFreeClassrooms = (classroomIds, needComputer) =>{
	const query = {
		_id: {$nin: classroomIds},
		hasComputers: needComputer
	}

	return Classroom.find(query);

}

// module.exports.getClassroomByName = (classroom_name, cb) => {
// 	const query = { name: classroom_name };
// 	Classroom.findOne(query, cb);
// };
