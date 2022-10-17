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

class LobbyView {
    constructor () {
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
                    <textarea name="" id="" cols="30" rows="1">    </textarea>
                    <button>Send</button>
                </div>
            </div>`
        );
        this.titleElem = this.elem.querySelector("h4.room-name");
        this.chatElem = this.elem.querySelector("div.message-list");
        this.inputElem = this.elem.querySelector("textarea");
        this.buttonElem = this.elem.querySelector("button");
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
    }
}

// ***TODO*** Task 5C & 5D & 5E??
class Lobby {
    constructor () {        //5C
        // this.rooms = {k1:Room.id, id:new Room()};
        this.rooms = {
            "1": new Room(1, "room1"),
            "2": new Room(1, "room2"),
            "3": new Room(1, "room3"),
            "4": new Room(1, "room4") };
    }

    getRoom(roomId) {       //5D
        for(var key in this.rooms) {
            if(key == roomId) {
                return this.rooms[key];
            }
        }
        return null;
    }

    addRoom(id, name, image, messages) {       //5E
        var room = new Room(id, name, image, messages);
        this.rooms[id] = room;
    }
}


function main () {
    var lobbyView = new LobbyView();
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
            var content = chatView.elem;
        } 
        else if(urlHash.includes("#/profile")) {
            var content = profileView.elem;
        }

        pageViewElem.append(content);
    }

    renderRoute();
    window.addEventListener("popstate", renderRoute);

    // Testing
    cpen322.export(arguments.callee, {renderRoute, lobbyView, chatView, profileView});
}

window.addEventListener("load", main);