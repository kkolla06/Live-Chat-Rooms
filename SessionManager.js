const crypto = require('crypto');

class SessionError extends Error {};

function SessionManager (){
	// default session length - you might want to
	// set this to something small during development
	const CookieMaxAgeMs = 600000;

	// keeping the session data inside a closure to keep them protected
	const sessions = {};

	// might be worth thinking about why we create these functions
	// as anonymous functions (per each instance) and not as prototype methods
	this.createSession = (response, username, maxAge = CookieMaxAgeMs) => {
        var token = crypto.randomBytes(64).toString('base64url');
        var sessionObj = {
            "username": username,
            "created": Date.now()
        }
        sessions[token] = sessionObj;

        response.cookie('cpen322-session', token, { maxAge: maxAge});

        setTimeout(() => { delete sessions[token]; }, maxAge);
	};

	this.deleteSession = (request) => {
        delete request.username;
        delete sessions[request.session];
        delete request.session;
	};

	this.middleware = (request, response, next) => {
        if(request.headers.cookie) {
            var cookies = request.headers.cookie.split(';');
            
            var found = false;
            for(var i = 0; i<cookies.length; i++) {
		        var val = cookies[i].split('=');
                var cookieVal = val[1];

                if(cookieVal in sessions) {
                    request.username = sessions[cookieVal]['username'];
                    request.session = cookieVal;
                    found = true;
                    next();
                    break;
                } 
            }
            if(!found) {
                next(new SessionError());
            }

        } else {
            next(new SessionError());
        }
	};

	// this function is used by the test script.
	// you can use it if you want.
	this.getUsername = (token) => ((token in sessions) ? sessions[token].username : null);
};

// SessionError class is available to other modules as "SessionManager.Error"
SessionManager.Error = SessionError;

module.exports = SessionManager;