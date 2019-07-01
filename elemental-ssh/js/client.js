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
    let oldwidth = loginButton.style.width;

    //<editor-fold desc="Make Loading Spinner">
    loginButton.style.width = "40px";
    loginButton.innerHTML = "";
    let loadingspinner = document.createElement("IMG");
    loadingspinner.setAttribute("src", "images/loading.gif");
    loadingspinner.style.width = "20px";
    loadingspinner.style.height = "20px";
    loginButton.appendChild(loadingspinner);
    //</editor-fold>

    mainserver.login(loginEmail.value, loginPassword.value, function (err, body) {
        try {
            if (err) {
                $(loginMessage).html(err.replace("\n", "").substring(0, 64));
                $(loginMessage).css("visibility", "visible");
                $(loginMessage).css("color", "red");
                loginButton.style.width = oldwidth;
                loginButton.innerHTML = "Login";
            }
            if (!body.succeeded) {
                $(loginMessage).html(body.message.replace("\n", "").substring(0, 64));
                $(loginMessage).css("visibility", "visible");
                $(loginMessage).css("color", "red");
                loginButton.style.width = oldwidth;
                loginButton.innerHTML = "Login";
            } else {
                mainserver.setSession(body.message.replace("User successfully logged in. ", ""));
                $(registerMessage).css("visiblity", "hidden");
                $(registerMessage).html();
                $(loginMessage).css("visiblity", "hidden");
                $(loginMessage).html();
                $("#loginSignupPage").fadeOut();
                $("#accountmanagementname").html(loginEmail.value);
                loginButton.style.width = oldwidth;
                loginButton.innerHTML = "Login";
            }
        } catch (e) {
            $(loginMessage).html("Unknown Error Occured");
            $(loginMessage).css("visibility", "visible");
            $(loginMessage).css("color", "red");
            loginButton.style.width = oldwidth;
            loginButton.innerHTML = "Login";
        }
    });
});
//</editor-fold>

//<editor-fold desc="Register Button">
registerButton.addEventListener("click", function () {
    let oldwidth = registerButton.style.width;
    registerButton.style.width = "40px";
    registerButton.innerHTML = "";
    let loadingspinner = document.createElement("IMG");
    loadingspinner.setAttribute("src", "images/loading.gif");
    loadingspinner.style.width = "20px";
    loadingspinner.style.height = "20px";
    registerButton.appendChild(loadingspinner);
    mainserver.register(registerEmail.value, registerPassword.value, function (err, body) {
        try {
            if (err) {
                $(registerMessage).html(err.replace("\n", "").substring(0, 64));
                $(registerMessage).css("visibility", "visible");
                $(registerMessage).css("color", "red");
                registerButton.style.width = oldwidth;
                registerButton.innerHTML = "Register";
            }
            if (!body.succeeded) {
                $(registerMessage).html(body.message.replace("\n", "").substring(0, 64));
                $(registerMessage).css("visibility", "visible");
                $(registerMessage).css("color", "red");
                registerButton.style.width = oldwidth;
                registerButton.innerHTML = "Register";
            } else {
                $(registerMessage).css("visiblity", "hidden");
                $(registerMessage).html();
                $(loginMessage).css("visiblity", "hidden");
                $(loginMessage).html();
                $("#loginSignupPage").fadeOut();
                $("#accountmanagementname").html(registerEmail.value);
                registerButton.style.width = oldwidth;
                registerButton.innerHTML = "Register";
            }
        } catch (e) {
            $(registerMessage).html("Unknown Error Occured");
            $(registerMessage).css("visibility", "visible");
            $(registerMessage).css("color", "red");
            registerButton.style.width = oldwidth;
            registerButton.innerHTML = "Register";
        }
    });
});
//</editor-fold>

//<editor-fold desc="Skip Login/Register">
$("#skipaccount").click(function () {
    $("#loginSignupPage").fadeOut(200);
});
//</editor-fold>

//<editor-fold desc="Logout Buttons">
$("#exitbtn, #navlogoutbarbtn").click(function () {
    logout();
});
//</editor-fold>

//<editor-fold desc="Logout Function">
function logout() {
    mainserver.invalidateSession();
    $("#loginSignupPage").fadeIn();
    $("#accountmanagementname").html("Not Logged In");
    $("#hostslist").html("");
    $("#loginemail").val("");
    $("#loginpassword").val("");
    $("#registeremail").val("");
    $("#registerpassword").val("");
}

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