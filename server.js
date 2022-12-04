/**
 * Name: Kaushik Kolla
 * Student #: 74167503
 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const ws = require('ws');
const Database = require('./Database.js');
const SessionManager = require('./SessionManager');
const crypto = require('crypto');

const cpen322 = require('./cpen322-tester.js'); // Testing

function logRequest(req, res, next){
	console.log(`${new Date()}  ${req.ip} : ${req.method} ${req.path}`);
	next();
}

const host = 'localhost';
const port = 3000;
const clientApp = path.join(__dirname, 'client');

var db = new Database("mongodb://127.0.0.1:27017", "cpen322-messenger");
const broker = new ws.Server({port: 8000});
var sessionManager = new SessionManager();

const messageBlockSize = 10;

// express app
let app = express();

app.use(express.json()) 						// to parse application/json
app.use(express.urlencoded({ extended: true })) // to parse application/x-www-form-urlencoded
app.use(logRequest);							// logging for debug

// serve static files (client-side)
app.use('/', express.static(clientApp, { extensions: ['html'] }));
app.listen(port, () => {
	console.log(`${new Date()}  App Started. Listening on ${host}:${port}, serving ${clientApp}`);
});


var messages = {};
db.getRooms().then((result) => {
	result.forEach((roomObj) => {
		messages[roomObj._id] = [];
	})
},
(reject) => {
	console.log("\nError0: db.getRooms() Error")
});

var isCorrectPassword = function(password, saltedHash) {
	var salt = saltedHash.substring(0,20);
	var pass = saltedHash.substring(20,64);
    var saltedPassword = password + salt;
	return (pass === crypto.createHash("SHA256").update(saltedPassword).digest('base64'))
}

app.route('/login').post((req, res) => {
	var user = {
		"username": req.body["username"],
		"password": req.body["password"]
	};

	db.getUser(user.username).then((resolve) => {
		if(resolve && isCorrectPassword(user.password, resolve.password)) {
			sessionManager.createSession(res, resolve.username);
			res.redirect('/');
		} else {
			res.redirect('/login');
		}
	})
});

app.route('/chat/:room_id').get((req, res) => {	
	var id = req.params['room_id'];
	var room = db.getRoom(id);
	room.then((result) => {
		if(result) {
			res.status(200).send(JSON.stringify(result));
		} else {
			res.status(404).send(new Error("Error"));
		}
	}).catch((err) => {
		res.status(404).send(new Error("Error"));
	})
});

app.route('/chat').get((req, res) => {	
	db.getRooms().then((result) => {
		var roomObjsArr = [];
		result.forEach((roomObj) => {
			messages[roomObj._id] = [];

			var tempObj = {};
			tempObj._id = roomObj._id;
			tempObj.name = roomObj.name;
			tempObj.image = roomObj.image;
			tempObj.messages = messages[roomObj._id];
			roomObjsArr.push(tempObj);
		})
		res.send(roomObjsArr);
	},
	(reject) => {
		console.log("\nError2: db.getRooms() ");
	});
  })
  .post((req, res) => {
	var data = req.body;

	var add = db.addRoom(data);
	add.then(result => {
		messages[result._id] = [];
		res.status(200);
		res.send(result);
	},
	(reject) => {
		res.status(400);
		res.send(new Error(reject));
	})
 });


 
app.route('/chat/:room_id/messages').get((req, res) => {
	var id = req.params['room_id'];
	var before = req.query['before'];

	db.getLastConversation(id, before).then((result) => {
		console.log("result: " + result);
		if(result) {
			res.status(200);
			res.send(result);
		} else {
			res.status(404);
			res.send(new Error("getLastConversation Error"));
		}
	},
	(reject) => {
		res.status(404);
		res.send(new Error("server - getLastConv" + reject));
	})
});



broker.on('connection', (ws) => {
	ws.on('message', (data) => {
		var msg = JSON.parse(data);

		broker.clients.forEach((client) => {
			if (client != ws) { 
		  		client.send(JSON.stringify(msg));
			}
	  	});

		var msgObj = {
			text: msg.text,
			username: msg.username
		};
		messages[msg.roomId].push(msgObj);

		if(messages[msg.roomId].length == messageBlockSize) {
			var conv = {
                'room_id' : msg._id,
                'timestamp' : Date.now(),
                'messages' : messages[msg.roomId]
            };
	
			console.log("msgs: " + JSON.stringify(messages[msg.roomId]));

			db.addConversation(conv).then((resolve) => {
                    messages[msg.roomId] = [];
					console.log("resolve: " + resolve);
                }, 
				(reject)=> {
					console.log(new Error("server - broker - addConv"));
				}
            );
		}
		
	});
});


// cpen322.connect('http://52.43.220.29/cpen322/test-a4-server.js');	// Tests for Asst 4
cpen322.connect('http://52.43.220.29/cpen322/test-a5-server.js');
cpen322.export(__filename, { app, messages, broker, db, messageBlockSize, sessionManager, isCorrectPassword });