/**
 * Name: Kaushik Kolla
 * Student #: 74167503
 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const ws = require('ws');

const cpen322 = require('./cpen322-tester.js'); // Testing

function logRequest(req, res, next){
	console.log(`${new Date()}  ${req.ip} : ${req.method} ${req.path}`);
	next();
}

const host = 'localhost';
const port = 3000;
const clientApp = path.join(__dirname, 'client');

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


var chatrooms = [
	{
		id: "1001",
		name: "Everyone in CPEN 400D",
		image: "assets/everyone-icon.png"
	},
	{
		id: "1002",
		name: "Cancuks Fans",
		image: "assets/canucks.png"
	},
	{
		id: "1003",
		name: "Foodies Only",
		image: "assets/bibimbap.jpg"
	}
];

var messages = {
	"1001": [],
	"1002": [],
	"1003": []
};

app.route('/chat').get((req, res) => {	
	var roomObjsArr = [];
	for(var chatroom of chatrooms) {
		var tempObj = {};
		tempObj.id = chatroom.id;
		tempObj.name = chatroom.name;
		tempObj.image = chatroom.image;
		tempObj.messages = messages[chatroom.id];
		roomObjsArr.push(tempObj);
	}
	res.send(roomObjsArr);
  })
  .post((req, res) => {
	var data = req.body;
	if(data.name != null) {
		var tempId = chatrooms.length + 1;
		var room = {
			id: tempId.toString(),
			name: data.name,
			image: data.image
		}
		chatrooms.push(room);
		messages[room.id] = [];
		res.status(200);
		res.send(JSON.stringify(room));
	} else {
		res.status(400);
		res.send("Error: Data does not contain 'name'");
	}
  });

const broker = new ws.Server({port: 8000});

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
		
	});
});


cpen322.connect('http://52.43.220.29/cpen322/test-a3-server.js');
cpen322.export(__filename, { app, chatrooms, messages, broker });