// const { rejects } = require("assert");
// const { Console } = require("console");

/* Given helper functions: */
// Removes the contents of the given DOM element (equivalent to elem.innerHTML = '' but faster)
function emptyDOM (elem){
    while (elem.firstChild) elem.removeChild(elem.firstChild);
}

// Creates a DOM element from the given HTML string
function createDOM (htmlString){
    let template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    return template.content.firstChild;
}

var Service = {
    origin: window.location.origin,
    getAllRooms: function() {
        var getReq = new XMLHttpRequest();
        getReq.open("GET", Service.origin + "/chat");
        getReq.send();

        return new Promise((onResolve, onReject) => {
            getReq.onload = function() {
                if(getReq.status == 200) {
                    onResolve(JSON.parse(getReq.responseText));
                } else {
                    onReject(new Error(getReq.responseText));
                }
            }

            getReq.onerror = function() {
                onReject(new Error(getReq.responseText));
            }
        })
    },
    addRoom: function(data) {
        var postReq = new XMLHttpRequest();
        postReq.open("POST", Service.origin + "/chat");
        postReq.setRequestHeader('Content-type', 'application/json');
        postReq.send(JSON.stringify(data));

        return new Promise((onResolve, onReject) => {
            postReq.onload = function() {
                if(postReq.status == 200) {
                    onResolve(JSON.parse(postReq.responseText));
                } else {
                    onReject(new Error(postReq.responseText));
                }
            }

            postReq.onerror = function() {
                onReject(new Error(postReq.responseText));
            }
        }) 
    }

};

var profile = {
    username: "Alice"
};

class LobbyView {
    constructor (lobby) {
        this.lobby = lobby;
        this.elem = createDOM(
            `<div class="content">
                <ul class="room-list">
                    <li> <a href="#/chat"> <img src="assets/everyone-icon.png"> Everyone in CPEN 400D </a> </li>
                    <li> <a href="#/chat"> <img src="assets/canucks.png"> Cancuks Fans </a> </li>
                    <li> <a href="#/chat"> <img src="assets/minecraft.jpg"> Minecraft Mavericks </a> </li>
                    <li> <a href="#/chat"> <img src="assets/bibimbap.jpg"> Foodies Only </a> </li>
                </ul>
                
                <div class="page-control">
                    <input type="text" placeholder="Room Title">
                    <button>Create Room</button>
                </div>
            </div>`
        );
        this.listElem = this.elem.querySelector("ul.room-list");
        this.inputElem = this.elem.querySelector("input");
        this.buttonElem = this.elem.querySelector("button");

        var self = this;

        this.buttonElem.addEventListener("click", (event) => {
            var data = {
                name: self.inputElem.value.trim(),
                image: "assets/everyone-icon.png"
            }
            var newRoom = Service.addRoom(data);
            newRoom.then((result) => {
                self.lobby.addRoom(result.id, result.name, result.image, result.messages);
            },
            (reject) => {
                console.log("Error: addRoom Proimse - " + reject);
            });

            self.inputElem.value = '';
        });

        this.redrawList();

        this.lobby.onNewRoom = function(room) {
            self.room = room;
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = "#/chat/" + self.room.id;
            var image = document.createElement("img");
            image.src = self.room.image;
            a.appendChild(image);
            var text = document.createTextNode(self.room.name);
            a.appendChild(text);
            li.appendChild(a);
            self.listElem.appendChild(li);
        }
    }

    redrawList() {
        emptyDOM(this.listElem);
        for(var key in this.lobby.rooms) { 
            var li = document.createElement("li");
            var a = document.createElement("a");
            a.href = "#/chat/" + key;
            var image = document.createElement("img");
            image.src = this.lobby.rooms[key].image;
            a.appendChild(image);
            var text = document.createTextNode(this.lobby.rooms[key].name);
            a.appendChild(text);
            li.appendChild(a);
            this.listElem.appendChild(li);
        }
    }
}

class ChatView {
    constructor (socket) {
        this.socket = socket;
        this.elem = createDOM(
            `<div class="content">
                <h4 class="room-name"> Everyone in CPEN 400D </h4>
                
                <div class="message-list">
                    <div class="message">
                        <span class="message-user">Alice</span>
                        <span class="message-text">Hello!</span>
                    </div>
                    <div class="message my-message">
                        <span class="message-user">Bob</span>
                        <span class="message-text">Hey!</span>
                    </div>
                </div>
                
                <div class="page-control">
                    <textarea name="" id="" cols="30" rows="1"></textarea>
                    <button>Send</button>
                </div>
            </div>`
        );
        this.titleElem = this.elem.querySelector("h4.room-name");
        this.chatElem = this.elem.querySelector("div.message-list");
        this.inputElem = this.elem.querySelector("textarea");
        this.buttonElem = this.elem.querySelector("button");

        this.room = null;

        var self = this;
        this.buttonElem.addEventListener("click", function() {
            self.sendMessage();
        });
        this.inputElem.addEventListener("keyup", function(event) {
            if (event.code == 'Enter'  && !event.shiftKey) {
                self.sendMessage();
            }
        });
    }

    sendMessage() {
        this.room.addMessage(profile.username, this.inputElem.value);        
        var sendMsg = {
            roomId: this.room.id,
            username: profile.username,
            text: this.inputElem.value
        };
        this.socket.send(JSON.stringify(sendMsg));
        this.inputElem.value = '';
    }

    setRoom(room) {
        this.room = room; 
        this.titleElem.textContent = this.room.name;
        var self = this;
        emptyDOM(this.chatElem);

        for(var msg in this.room.messages) {  
            var div_msg = document.createElement("div");
            var span_user = document.createElement("span");
            var span_msg = document.createElement("span");

            if(msg.username == profile.username) {
                div_msg.className = "message my-message";
                span_user.className = "message-user";
                var user = document.createTextNode(profile.username);
                span_msg.className = "message-text";
                var user_msg = document.createTextNode(this.room.messages[msg].text);
            } else {
                div_msg.className = "message";
                span_user.className = "message-user";
                var user = document.createTextNode(this.room.messages[msg].username);
                span_msg.className = "message-text";
                var user_msg = document.createTextNode(this.room.messages[msg].text);
            }
            div_msg.appendChild(span_user);
            span_user.appendChild(user);
            div_msg.appendChild(span_msg);
            span_msg.appendChild(user_msg);

            this.chatElem.appendChild(div_msg);
        }

        this.room.onNewMessage = function(message) {
            var div_msg = document.createElement("div");
            var span_user = document.createElement("span");
            var span_msg = document.createElement("span");

            if(message.username == profile.username) {
                div_msg.className = "message my-message";
                span_user.className = "message-user";
                var user = document.createTextNode(profile.username);
                span_msg.className = "message-text";
                var user_msg = document.createTextNode(message.text);
            } else {
                div_msg.className = "message";
                span_user.className = "message-user";
                var user = document.createTextNode(message.username);
                span_msg.className = "message-text";
                var user_msg = document.createTextNode(message.text);
            }
            div_msg.appendChild(span_user);
            span_user.appendChild(user);
            div_msg.appendChild(span_msg);
            span_msg.appendChild(user_msg);

            self.chatElem.appendChild(div_msg);
        }
    }
}

class ProfileView {
    constructor () {
        this.elem = createDOM(
            `<div class="content">
                <div class="profile-form">
                    <div class="form-field">
                        <label> Username </label>
                        <input type="text">
                    </div>
                    <div class="form-field">
                        <label> Password </label>
                        <input type="password">
                    </div>
                    <div class="form-field">
                        <label> Profile Avatar </label>
                        <input type="file">
                    </div>
                </div>
                <div class="page-control">
                    <button>Save</button>
                </div>
            </div>`
        );
    }
}


class Room {
    constructor (id, name, image = 'assets/everyone-icon.png', messages = []) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.messages = messages;
    }

    addMessage(username, text) {
        if(text.trim() == "") {
            return 0;
        }
        var msg = {
            username: username,
            text: text
        };
        this.messages.push(msg);

        if(this.onNewMessage) {
            this.onNewMessage(msg);
        }
    }
}

class Lobby {
    constructor () {        
        this.rooms = {};
    }

    getRoom(roomId) { 
        for(var key in this.rooms) {
            if(key == roomId) {
                return this.rooms[key];
            }
        }
        return null;
    }

    addRoom(id, name, image, messages) {
        if(name != "" && name != null) {
            var newRoom = new Room(id, name, image, messages);
            this.rooms[id] = newRoom;

            if(this.onNewRoom != undefined) {
                this.onNewRoom(newRoom);
            }
        }
    }
}


function main () {
    var lobby = new Lobby();
    var lobbyView = new LobbyView(lobby);
    var socket = new WebSocket("ws://localhost:3000");
    var chatView = new ChatView(socket);
    var profileView = new ProfileView();

    function renderRoute() {
        var pageViewElem = document.getElementById("page-view");
        emptyDOM(pageViewElem);

        var urlHash = window.location.hash;
        if(urlHash == "" || urlHash == "#/") {
            var content = lobbyView.elem;
        } 
        else if(urlHash.includes("#/chat")) {
            var link = urlHash.split('/');
            var roomId = link[2];
            var room = lobby.getRoom(roomId);

            if(room != null) {
                chatView.setRoom(room);
            }
            var content = chatView.elem;
        } 
        else if(urlHash.includes("#/profile")) {
            var content = profileView.elem;
        }

        pageViewElem.append(content);
    }

    renderRoute();
    window.addEventListener("popstate", renderRoute);

    function refreshLobby() {
        var refresh = Service.getAllRooms();
        refresh.then(
            (result) => {
                for(var refreshRoom of result) {
                    if(refreshRoom.id in lobby.rooms) {
                        lobby.getRoom(refreshRoom.id).name = refreshRoom.name; 
                        lobby.getRoom(refreshRoom.id).image = refreshRoom.image;
                    } else {
                        lobby.addRoom(refreshRoom.id, refreshRoom.name, refreshRoom.image, refreshRoom.messages);
                    }
                }
            },
            (reject) => {
                console.log("Refresh Lobby Error");
            }
        )
    }

    refreshLobby();
    var timer = setInterval(refreshLobby, 10000);

    socket.addEventListener("message", (event) => {
        var msgData = JSON.parse(event.data);
        var room = lobby.getRoom(msgData.roomId);
        room.addMessage(msgData.username, msgData.text);
    })

    // Exporting variables for testing
    cpen322.export(arguments.callee, {renderRoute, lobbyView, chatView, profileView, lobby, refreshLobby, socket});
}

window.addEventListener("load", main);