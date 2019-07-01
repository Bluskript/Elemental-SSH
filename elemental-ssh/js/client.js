let request = require("request");

let libElementalSSH = require("lib-elemental-ssh");

window.$ = window.jQuery = require("jquery");

const loginPageButton = $("#tab1");
const registerPageButton = $("#tab2");
const registerPage = $("#registerpage");
const loginPage = $("#loginpage");

const loginEmail = document.getElementById("loginemail"),
    loginPassword = document.getElementById("loginpassword"),
    loginButton = document.getElementById("loginbtn"),
    loginMessage = document.getElementById("loginmsg"),
    registerEmail = document.getElementById("registeremail"),
    registerPassword = document.getElementById("registerpassword"),
    registerButton = document.getElementById("registerbtn"),
    registerMessage = document.getElementById("registermsg"),
    changeServers = document.getElementById("changeservers"),
    pingHostButton = document.getElementById("pingHostButton"),
    changeServerButton = document.getElementById("changeServerButton");

let mainserver = libElementalSSH.createConnection("https://elementalssh.tk");

function addLoadingSpinner(element) {
    element.innerHTML = "";
    element.style.width = "20%";
    let loadingSpinner = document.createElement("IMG");
    loadingSpinner.setAttribute("src", "images/loading.gif");
    loadingSpinner.style.width = "20px";
    loadingSpinner.style.height = "20px";
    element.appendChild(loadingSpinner);
}

function resetEntryPage() {
    registerMessage.style.visibility = "hidden";
    loginMessage.style.visibility = "hidden";
    loginButton.style.width = "80%";
    loginButton.innerHTML = "Login";
}

function displayEntryError(page, message) {
    if (page === "login") {
        $(loginMessage).html(message);
        $(loginMessage).css("visibility", "visible");
        $(loginMessage).css("color", "red");
        loginButton.style.width = "80%";
        loginButton.innerHTML = "Login";
    } else {
        $(registerMessage).html(message);
        $(registerMessage).css("visibility", "visible");
        $(registerMessage).css("color", "red");
        registerButton.style.width = "80%";
        registerButton.innerHTML = "Register";
    }
}

//<editor-fold desc="Logout Function">
function logout() {
    mainserver.invalidateSession();
    $("#entryPage").fadeIn();
    $("#accountmanagementname").html("Not Logged In");
    $("#hostslist").html("");
    $("#loginemail").val("");
    $("#loginpassword").val("");
    $("#registeremail").val("");
    $("#registerpassword").val("");
}

//</editor-fold>

//<editor-fold desc="When everything is completely loaded">
$(window).on("DOMContentLoaded", function () {
    require("electron").remote.getCurrentWindow().show();
});
//</editor-fold>

//<editor-fold desc="Login Tab Button">
loginPageButton.click(function () {
    registerPage.fadeOut(100, function () {
        loginPageButton.addClass("selectedform");
        registerPageButton.removeClass("selectedform");
        $(loginPage).fadeIn(100);
    });
});
//</editor-fold>

//<editor-fold desc="Register Tab Button">
registerPageButton.click(function () {
    $("#loginpage").fadeOut(100, function () {
        registerPageButton.addClass("selectedform");
        loginPageButton.removeClass("selectedform");
        $(registerPage).fadeIn(100);
    });
});
//</editor-fold>

//<editor-fold desc="Login Button">
loginButton.addEventListener("click", function () {
    addLoadingSpinner(loginButton);
    mainserver.login(loginEmail.value, loginPassword.value, function (err, body) {
        try {
            if (err) {
                displayEntryError("login", err.replace("\n", "".substring(0, 64)));
            }
            if (!body.succeeded) {
                displayEntryError("login", body.message.replace("\n", "").substring(0, 64));
            } else {
                $("#entryPage").fadeOut();
                $("#accountmanagementname").html(loginEmail.value);
                resetEntryPage();
            }
        } catch (e) {
            displayEntryError("login", "An Unknown Error Occured");
        }
    });
});
//</editor-fold>

//<editor-fold desc="Register Button">
registerButton.addEventListener("click", function () {
    addLoadingSpinner(registerButton);
    mainserver.register(registerEmail.value, registerPassword.value, function (err, body) {
        try {
            if (err) {
                displayEntryError("register", err.replace("\n", "").substring(0, 64));
            }
            if (!body.succeeded) {
                displayEntryError("register", body.message.replace("\n", "").substring(0, 64));
            } else {
                resetEntryPage();
                $("#entryPage").fadeOut();
                $("#accountmanagementname").html(registerEmail.value);
            }
        } catch (e) {
            displayEntryError("register", "An Unknown Error Occured");
        }
    });
});
//</editor-fold>

//<editor-fold desc="Skip Login/Register">
$("#skipaccount").click(function () {
    $("#entryPage").fadeOut(200);
});
//</editor-fold>

//<editor-fold desc="Logout Buttons">
$("#exitbtn, #navlogoutbarbtn").click(function () {
    logout();
});
//</editor-fold>

//<editor-fold desc="Changing Servers">
pingHostButton.addEventListener("click", function () {
    document.getElementById("pingblock").style.visibility = "visible";
    document.getElementById("pingstatus").innerHTML = "Pinging...";
    document.getElementById("pingicon").className = "fas fa-redo";
    document.getElementById("pingicon").style.animation = "rotation 2s infinite linear";
    document.getElementById("pingicon").style.color = "limegreen";
    let host = document.getElementById("switch-auth-server").value.includes("https://") ? document.getElementById("switch-auth-server").value : "https://" + document.getElementById("switch-auth-server").value;
    request(host, {}, (err, res, body) => {
        if (err) {
            document.getElementById("pingstatus").innerHTML = "Ping Failed";
            document.getElementById("pingicon").className = "fas fa-times";
            document.getElementById("pingicon").style.removeProperty("animation");
            document.getElementById("pingicon").style.color = "red";
        } else {
            document.getElementById("pingstatus").innerHTML = "Pinged Successfully";
            document.getElementById("pingicon").className = "fas fa-check";
            document.getElementById("pingicon").style.removeProperty("animation");
            document.getElementById("pingicon").style.color = "limegreen";
        }
    });
});

changeServerButton.addEventListener("click", function () {
    mainserver = libElementalSSH.createConnection(document.getElementById("switch-auth-server").value.includes("https://") ? document.getElementById("switch-auth-server").value : "https://" + document.getElementById("switch-auth-server").value);
});

changeServers.addEventListener("click", function () {
    document.getElementById("switch-auth-server").value = mainserver.getIP().replace("http://", "").replace("https://", "");
});

//</editor-fold>