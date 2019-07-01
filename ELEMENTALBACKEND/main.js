//<editor-fold desc="Dependencies">
const express = require("express");
const mysql = require("promise-mysql");
const bodyParser = require("body-parser");
const passwordPolicy = require("password-policy");
const bcrypt = require("bcrypt");
const rateLimit = require("rate-limiter-flexible");
const fs = require("fs");
const https = require("https");
const readlineSync = require("readline-sync");
//</editor-fold>

//<editor-fold desc="SQL Credentials">
let sqlhost, sqluser, sqlpass;

try {
    let readCredentials = fs.readFileSync("credentials.json", "utf8");
    ({"sql_host": sqlhost, "sql_username": sqluser, "sql_password": sqlpass} = JSON.parse(readCredentials));
}
catch (e) {
    let configJSON = {};
    console.log("Config file not detected, starting setup");
    configJSON["sql_host"] = readlineSync.question("Please enter the MySQL host\n");
    configJSON["sql_username"] = readlineSync.question("Please enter the MySQL username\n");
    configJSON["sql_password"] = readlineSync.question("Please enter the MySQL password\n", {hideEchoBack: true, mask: "*"});
    fs.writeFileSync("credentials.json", JSON.stringify(configJSON), "utf8");
}
//</editor-fold>

//<editor-fold desc="Create SQL Connection">
let conn;

mysql.createConnection({
    host: sqlhost,
    user: sqluser,
    password: sqlpass
}).then(function (connection) {
    conn = connection;
});
//</editor-fold>

//<editor-fold desc="Rate Limits">
const registerLimit = new rateLimit.RateLimiterMemory({points: 5, duration: 60 * 15});
const loginLimit = new rateLimit.RateLimiterMemory({points: 15, duration: 60 * 15});
//</editor-fold>

//<editor-fold desc="Initialize Express App">
let app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
try {
    https.createServer({
        key: fs.readFileSync('/etc/letsencrypt/live/elementalssh.tk/privkey.pem', "utf8"),
        cert: fs.readFileSync('/etc/letsencrypt/live/elementalssh.tk/cert.pem', "utf8"),
        ca: fs.readFileSync('/etc/letsencrypt/live/elementalssh.tk/chain.pem', "utf8")
    }, app).listen(443, function () {
        console.log("Serving on port 443");
    });
} catch (e) {
    throw new Error("Unfortunately, you do not appear to support HTTPS! Please register using LetsEncrypt or wait until this is fixed.");
}
//</editor-fold>

//<editor-fold desc="Redirect HTTP to HTTPS">
let httpRedirect = express();
httpRedirect.get("*", function (req, res) {
    res.redirect('https://' + req.headers.host + req.url);
});

httpRedirect.listen(80);
//</editor-fold>

//<editor-fold desc="Get Hosts Route">
app.post("/gethosts", function (req, res) {
    let response = {"succeeded": "", "message": ""};
    let email = req.body.email;
    let password = req.body.password;

    conn.query("SELECT * FROM elementalssh.users WHERE email=?", [email], function (err, result) {
        if (err || result.length === 0) {
            response.succeeded = false;
            response.message = "Error fetching hosts";
            res.json(response);
            loginLimit.consume(req.connection.remoteAddress, 1);
        } else {
            bcrypt.compare(password, result[0].password).then(function (verified) {
                if (verified) {
                    loginLimit.get(req.connection.remoteAddress).then(function (rateLimiterRes) {
                        if (rateLimiterRes !== null) {
                            if (rateLimiterRes.remainingPoints > 0) {
                                response.succeeded = true;
                                response.message = result[0].servers;
                                res.json(response);
                            } else {
                                response.succeeded = false;
                                response.message = "Error fetching hosts";
                                res.json(response);
                            }
                        } else {
                            response.succeeded = true;
                            response.message = result[0].servers;
                            res.json(response);
                        }
                    });
                } else {
                    loginLimit.consume(req.connection.remoteAddress, 1).then(function () {

                    }).catch(function () {

                    });
                    response.succeeded = false;
                    response.message = "Error fetching hosts";
                    res.json(response);
                }
            });
        }
    });
});
//</editor-fold>

//<editor-fold desc="Add Host Route">
app.post("/edithosts", function (req, res) {
    let editedhosts = req.body.editedhosts;
    let email = req.body.email;
    let password = req.body.password;
    let response = {"succeeded": false, "message": "Error editing hosts"};

    conn.query("SELECT * FROM elementalssh.users WHERE email=?", [email], function (err, result) {
        if (result.length === 0) {
            res.send("Invalid email or password.");
        } else {
            bcrypt.compare(password, result[0]).then(function (verified) {
                if (!verified) {
                    response.succeeded = false;
                    response.message = "Invalid email or password.";
                } else {
                    conn.query("UPDATE elementalssh.users SET servers=? WHERE email=?", [editedhosts, email], function (err) {
                        if (err) {
                            response.succeeded = false;
                            response.message = "Failed to edit hosts";
                        } else {
                            response.succeeded = true;
                            response.message = "Successfully added host";
                        }
                    });
                }
            }).catch(function () {
                response.succeeded = false;
                res.json(response);
            });
        }
    });
});
//</editor-fold>

//<editor-fold desc="Register Route">
app.post("/register", function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let response = {"succeeded": "", "message": ""};

    if (!email) {
        response.succeeded = false;
        response.message = "Missing email";
        res.json(response);
    } else if (!password) {
        response.succeeded = false;
        response.message = "Missing password";
        res.json(response);
    } else if (!passwordPolicy.hasLowerCase(password)) {
        response.succeeded = false;
        response.message = "Password must have at least one lowercase character";
        res.json(response);
    } else if (!passwordPolicy.hasUpperCase(password)) {
        response.succeeded = false;
        response.message = "Password must have at least one uppercase character";
        res.json(response);
    } else if (!passwordPolicy.hasNumber(password)) {
        response.succeeded = false;
        response.message = "Password must have at least one number";
        res.json(response);
    } else if (!passwordPolicy.hasSpecialCharacter(password)) {
        response.succeeded = false;
        response.message = "Password must have at least one special character";
        res.json(response);
    } else if (password.length < 6) {
        response.succeeded = false;
        response.message = "Password must be at least 6 characters long";
        res.json(response);
    } else if (!validateEmail(email)) {
        response.succeeded = false;
        response.message = "Invalid email";
        res.json(response);
    } else {
        registerLimit.consume(req.connection.remoteAddress, 1).then(function () {
            conn.query("SELECT * FROM elementalssh.users WHERE email=?", [email], function (err, result) {
                if (result === undefined || result.length === 0) {
                    bcrypt.hash(password, 10).then(function (hashedpass) {
                        conn.query("INSERT INTO elementalssh.users(email, password, servers) VALUES(?, ?, ?)", [email, hashedpass, ""], function (err) {
                            if (err) {
                                response.succeeded = false;
                                response.message = "Unable to register, try after some time.";
                                res.json(response);
                                console.log(err);
                            } else {
                                response.succeeded = true;
                                response.message = "Registeration successful";
                                res.json(response);
                            }
                        });
                    });
                } else {
                    response.succeeded = false;
                    response.message = "Email has already been registered";
                    res.json(response);
                }
            });
        }).catch(function () {
            response.succeeded = false;
            response.message = "You're doing that way too much. Try again in 15 minutes.";
            res.json(response);
        });
    }
});
//</editor-fold>

//<editor-fold desc="Login Route">
app.post("/login", function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let response = {"succeeded": "", "message": ""};

    if (!email) {
        response.succeeded = false;
        response.message = "Missing email";
        res.json(response);
    } else if (!password) {
        response.succeeded = false;
        response.message = "Missing password";
        res.json(response);
    } else if (!validateEmail(email)) {
        response.succeeded = false;
        response.message = "Invalid email";
        res.json(response);
    } else {
        loginLimit.consume(req.connection.remoteAddress, 1).then(function () {
            conn.query("SELECT * FROM elementalssh.users WHERE email=?", [email]).then(function (selectusers) {
                if (selectusers === undefined || selectusers.length === 0) {
                    response.succeeded = false;
                    response.message = "Invalid email or password";
                    res.json(response);
                } else {
                    bcrypt.compare(password, selectusers[0].password)
                        .then(function (verified) {
                            if (verified) {
                                response.succeeded = true;
                                response.message = "Login Successful";
                                res.json(response);
                            } else {
                                response.succeeded = false;
                                response.message = "Invalid Email Or Password";
                                res.json(response);
                            }
                        });
                }
            }).catch(function (err) {
                console.log(err);
                response.succeeded = false;
                response.message = "Error while logging in";
                res.json(response);
            });
        }).catch(function () {
            response.succeeded = false;
            response.message = "You're doing that too much. Try again in 15 minutes.";
            res.json(response);
        });
    }
});
//</editor-fold>

//<editor-fold desc="Useful Functions">
/**
 * @param email the email that's being validated
 * @returns {boolean} whether it's valid or not
 */
function validateEmail(email) {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g.test(email);
}

//</editor-fold>