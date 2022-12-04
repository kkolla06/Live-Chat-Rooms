const e = require('express');
const { MongoClient, ObjectID, ObjectId } = require('mongodb');	// require the mongodb driver

/**
 * Uses mongodb v4.2+ - [API Documentation](http://mongodb.github.io/node-mongodb-native/4.2/)
 * Database wraps a mongoDB connection to provide a higher-level abstraction layer
 * for manipulating the objects in our cpen322 app.
 */
function Database(mongoUrl, dbName){
	if (!(this instanceof Database)) return new Database(mongoUrl, dbName);
	this.connected = new Promise((resolve, reject) => {
		MongoClient.connect(
			mongoUrl,
			{
				useNewUrlParser: true
			},
			(err, client) => {
				if (err) reject(err);
				else {
					console.log('[MongoClient] Connected to ' + mongoUrl + '/' + dbName);
					resolve(client.db(dbName));
				}
			}
		)
	});
	this.status = () => this.connected.then(
		db => ({ error: null, url: mongoUrl, db: dbName }),
		err => ({ error: err })
	);
}

Database.prototype.getRooms = function(){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
            db.collection('chatrooms').find({}).toArray().then(doc => {
                resolve(doc);
            });
        })
    )	
}

Database.prototype.getRoom = function(room_id){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			var temp = null;

			db.collection('chatrooms').find({}).forEach(room => {
				if(room && room._id) {
					if(ObjectId.isValid(room._id) && room._id.toString() == room_id.toString()) {
						resolve(room);
					} 
					else if(room["_id"].toString() == room_id.toString()) {
						temp = room;
					}
				}   
            }).catch((err) => {
                reject(err);
            }).finally(() => {
				resolve(temp);
			})
		})
    )
}

Database.prototype.addRoom = function(room){
	return this.connected.then(db => 
		new Promise((resolve, reject) => {
			/* TODO: insert a room in the "chatrooms" collection in `db`
			 * and resolve the newly added room */

            if(room.name) {
                db.collection('chatrooms').insertOne(room).then(r => {
					room["_id"] = r.insertedId;
                    resolve(room);
                })
            } else {
                reject(new Error('Name not provided'));
            }
		})
	)
}

Database.prototype.getLastConversation = function(room_id, before){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: read a conversation from `db` based on the given arguments
			 * and resolve if found */

            if(!before) {
                before = Date.now();
            }

            var lastConv = null;

            db.collection('conversations').find({}).forEach((conv) => {
                if(conv.room_id == room_id && conv.timestamp < before && (lastConv == null || conv.timestamp > lastConv.timestamp)) {
                    lastConv = conv;
                }
            }, 
            (err) => {
				if (err) {
					reject(new Error("Conversation error: error"));
				} else {
                	resolve(lastConv);
				}
            })
		})
	)
}

Database.prototype.addConversation = function(conversation){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: insert a conversation in the "conversations" collection in `db`
			 * and resolve the newly added conversation */

			// console.log("CONV1: " + conversation.room_id);
			// console.log("CONV1: " + conversation.timestamp);
			// console.log("CONV1: " + conversation.messages);


            if(!(conversation.room_id && conversation.timestamp && conversation.messages)) {
                reject(new Error("Conversation Fields Missing"));
            } else {
                db.collection('conversations').insertOne(conversation).then(conv => {
					console.log("Conv Added: " + JSON.stringify(conversation));
					resolve(conversation);
				})
				// db.collection('conversations').insertOne(conversation);
				// resolve(conversation);
            }
		})
	)
}

Database.prototype.getUser = function(username){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			db.collection('users').find({}).forEach((user) => {
                if(user && user.username == username) {
					resolve(user);
				}
            }, 
            (err) => {
                if (err) {
					reject(new Error("Get User error"));
				} else {
                	resolve(null);
				}
            })
        })
    )	
}

module.exports = Database;