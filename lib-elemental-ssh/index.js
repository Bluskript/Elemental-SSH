const request = require("request");

class ServerConnection {
    /**
     * @param {string} serverip - where the auth server is
     */
    constructor(serverip) {
        this.ip = serverip;
    }

    /**
     * @description sends a request to the server with the given credentials
     * @param {string} email - the email
     * @param {string} password - the password
     * @param {function} callback - response function
     */
    login(email, password, callback) {
        request.post({
            url: this.ip + "/login",
            method: "POST",
            json: {
                email,
                password
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
                email,
                password
            }
        }, function (error, res, body) {
            if (error) {
                return callback(error);
            }
            return callback(null, body);
        });
    }

    getIP() {
        return this.ip;
    }
}

exports.createConnection = function (serverip) {
    return new ServerConnection(serverip);
};