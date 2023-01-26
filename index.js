const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/database');

// mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });

// mongoose.connection.on('connected', () => {
// 	console.log('Connected to database ' + config.database);
// });

// mongoose.connection.on('error', (err) => {
// 	console.log('Database error ' + err);
// });

const app = express();

const users = require('./routes/users');
const classrooms = require('./routes/classrooms');
const bookings = require('./routes/bookings');

const port = 3000;

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.use('/users', users);
app.use('/classrooms', classrooms);
app.use('/bookings', bookings);

app.get('/', (req, res) => {
	res.send('invalid endpoint');
});

const initDbConnection = async() => {
  try {
    await mongoose.connect(config.database);
    console.log('connected to db');
    
  } catch (error) {
    console.log(error);
  }
  // console.log(conn);
  // return conn;

}

const server = app.listen(port, () => {
  console.log('Server is running on port ' + port);
  initDbConnection();
});

//Socket init

const socket = require('./config/socket').init(server);
socket.on('connection', (socket) => {

	socket.on('die', () => {
		socket.disconnect(true);
	});

	socket.on('room', (data) => {
		if (data.action === 'connect') {
			socket.join(data.room);
		}
		if (data.action === 'disconnect') {
			socket.leave(data.room);
		}
	});
});

socket.on('connect', (client) => {
	client.on('openModal', (params) => {
		if (params['room']) {

			let interval = {
				from: params['interval']['from'],
				to: params['interval']['to'],
				beingEditet: true
			};

			socket.in(params['room']).emit('openModal', { interval: interval, open: true });
		} else if (!params['room'] && params['booking']) {
			let room = params['booking']['classroom']['_id'];
			let interval = {
				from: params['booking']['from'],
				to: params['booking']['to'],
				beingEditet: true,
				booking: params['booking']
			};
			socket.in(room).emit('openModal', { interval: interval, open: true });

		} else if (!params['room'] && !params['booking']) {
			let room = params['classroomId'];

			socket.in(room).emit('openModal', { interval: params['interval'], open: true });
		}
	});

	client.on('closeModal', (params) => {
		if (params['room']) {
			let interval = {
				from: params['interval']['from'],
				to: params['interval']['to'],
				beingEditet: false
			};

			socket.in(params['room']).emit('closeModal', { interval: interval, open: false });
		} else if (!params['room'] && params['booking']) {
			let room = params['booking']['classroom']['_id'];
			let interval = {
				from: params['booking']['from'],
				to: params['booking']['to'],
				beingEditet: false,
				booking: params['booking']
			};
			socket.in(room).emit('closeModal', { interval: interval, open: false });

		} else if (!params['room'] && !params['booking']) {
      let room = params['classroomId'];
			socket.in(room).emit('closeModal', { interval: params['interval'], open: false });
		}
	});
});
