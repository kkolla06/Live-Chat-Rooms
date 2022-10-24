/**
 * Name: Kaushik Kolla
 * Student #: 74167503
 */

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
            self.lobby.addRoom("room5", self.inputElem.value);
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
    constructor () {
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
        this.rooms = {
            "room1": new Room("room1", "Everyone in CPEN 400D", "assets/everyone-icon.png"),
            "room2": new Room("room2", "Cancuks Fans", "assets/canucks.png"),
            "room3": new Room("room3", "Minecraft Mavericks", "assets/minecraft.jpg"),
            "room4": new Room("room4", "Foodies Only", "assets/bibimbap.jpg")
        };
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
    var chatView = new ChatView();
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

    // Exporting variables for testing
    cpen322.export(arguments.callee, {renderRoute, lobbyView, chatView, profileView, lobby});
}

window.addEventListener("load", main);