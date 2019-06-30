const request = require("request");

exports.createConnection = function (serverip) {
    return new serverConnection(serverip);
};

class serverConnection {
    /**
     * @param {string} serverip the IP address where the API resides
     */
    constructor(serverip) {
        this.ip = serverip;
        this.session = "null";
    }

    /**
     * @description sends a request to the server with the given credentials
     * @param {string} email the email
     * @param {string} password the password
     * @param {function} callback the function to return results to
     */
    login(email, password, callback) {
        request.post({
            url: this.ip + "/login",
            method: "POST",
            json: {
                "email": email,
                "password": password
            }
        }, function (error, res, body) {
            if (error || res.statusCode !== 200) {
                callback(error);
            }
            callback(null, body);
        });
    }

    register(email, password, callback) {
        request.post({
            url: this.ip + "/register",
            method: "POST",
            json: {
                "email": email,
                "password": password
            }
        }, function (error, res, body) {
            if (error) {
                return callback(error);
            }
            return callback(null, body);
        });
    }

    getServers(callback) {
        request.post({
            url: this.ip + "/getservers",
            method: "POST",
            json: {
                "session": this.getSession()
            }
        }, function (error, res, body) {
            if (error || res.statusCode !== 200) {
                callback(error);
            }
            callback(null, body);
        });
    }

    setSession(insession) {
        this.session = insession;
    }

    getSession() {
        return this.session;
    }

    invalidateSession() {
        this.session = "null";
    }

    getIP() {
        return this.ip;
    }
}