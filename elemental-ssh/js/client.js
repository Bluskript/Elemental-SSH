let request = require("request");

let libElementalSSH = require("lib-elemental-ssh");

const loginPageButton = $("#tab1");
const registerPageButton = $("#tab2");
const registerPage = $("#registerpage");
const loginPage = $("#loginpage");

const loginEmail = document.getElementById("loginEmail"),
    loginPassword = document.getElementById("loginPassword"),
    loginButton = document.getElementById("loginButton"),
    loginMessage = document.getElementById("loginMessage"),
    registerEmail = document.getElementById("registerEmail"),
    registerPassword = document.getElementById("registerPassword"),
    registerButton = document.getElementById("registerButton"),
    registerMessage = document.getElementById("registerMessage"),
    changeServers = document.getElementById("changeservers"),
    testConnectionButton = document.getElementById("testConnectionButton"),
    changeServerButton = document.getElementById("changeServerButton");

let mainserver = libElementalSSH.createConnection("https://elementalssh.tk");

$("input[name='elemental-auth-server']").change(function () {
    if ($("input[name='elemental-auth-server']:checked").val() === "custom") {
        document.getElementById("auth-server-input").disabled = false;
        M.toast({html: "May cause security issues. (Self-signed certificates not supported yet)"});
        M.toast({html: `<a onclick="require('electron').shell.openExternal('https://github.com/Bluskript/Elemental-SSH')" style="cursor: pointer">Download Auth Server</a>`})
    } else {
        document.getElementById("auth-server-input").disabled = true;
        mainserver = libElementalSSH.createConnection("https://elementalssh.tk");
    }
});

//<editor-fold desc="Entry UI Functions">
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

//</editor-fold>

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
    console.log(loginEmail.value);
    mainserver.login(loginEmail.value, loginPassword.value, function (err, body) {
        console.log({err, body});
        try {
            if (err) {
                displayEntryError("login", err.replace("\n", "".substring(0, 64)));
            }
            if (!body.succeeded) {
                displayEntryError("login", body.message.replace("\n", "").substring(0, 64));
            } else {
                console.log("login successful");
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
testConnectionButton.addEventListener("click", function () {
    testConnectionButton.innerHTML = "Pinging...";
    let host = "";
    if (document.getElementById("auth-server-input").disabled === true) {
        host = mainserver.getIP();
    } else if (document.getElementById("auth-server-input").value.includes("https://")) {
        host = document.getElementById("auth-server-input").value;
    } else if (document.getElementById("auth-server-input").value.includes("http://")) {
        host = document.getElementById("auth-server-input").value.replace("http://", "https://");
    } else {
        host = `https://${document.getElementById("auth-server-input").value}`;
    }
    request(host, {}, (err) => {
        if (err) {
            M.toast({html: "Unable to ping auth server"});
            testConnectionButton.innerHTML = "Test Connection";
        } else {
            M.toast({html: "Successfully pinged server"});
            testConnectionButton.innerHTML = "Test Connection";
        }
    });
});

changeServerButton.addEventListener("click", function () {
    let host = "";
    if (document.getElementById("auth-server-input").disabled === true) {
        host = mainserver.getIP();
    } else if (document.getElementById("auth-server-input").value.includes("https://")) {
        host = document.getElementById("auth-server-input").value;
    } else if (document.getElementById("auth-server-input").value.includes("http://")) {
        host = document.getElementById("auth-server-input").value.replace("http://", "https://");
    } else {
        host = `https://${document.getElementById("auth-server-input").value}`;
    }

    mainserver = libElementalSSH.createConnection(host);
});

//</editor-fold>