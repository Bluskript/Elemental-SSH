var filesystem = require('fs');

var user;
var password;
var output;
var hosts;
var loginreq = new XMLHttpRequest();
var mode = "login";

function decryptHosts()
{
    hosts = output.replace("User successfully logged in. ", "");
    hosts = JSON.parse(aes256.decrypt(password, hosts));
    document.getElementById("hostslist").innerHTML = "";
    for (var i = 0; i < hosts.length; i++)
    {
        document.getElementById("hostslist").innerHTML += `<div class="serverentry" ip="` + htmlEntities(hosts[i][1]) + `" style="display:flex;align-items:center;height: 90px;border-bottom: 1px solid rgb(54,54,54);overflow: visible">
        <i class="fas fa-server" style="color: rgb(221,221,221);font-size: 45px;margin-left: 3%;"></i>
        <h1 style="color: rgb(221,221,221);font-weight: normal;margin-left:2%; font-size: 27px;margin-right: 4%;">` + htmlEntities(hosts[i][0]) + `</h1>
        <button class="btn bmd-btn-icon dropdown-toggle" style="margin-left:auto; margin-right:2%" type="button" id="ex1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fas fa-ellipsis-v" style="font-size: 16px"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-left" aria-labelledby="ex1">
            <button class="dropdown-item" type="button">Edit</button>
            <button class="dropdown-item" type="button">Delete</button>
        </div>
    </div>`;
    }
    Waves.attach('.serverentry', ['waves-button', 'waves-float']);
    Waves.attach('.sidebaritem', ['waves-button']);
    Waves.init();
}

function storeAccountDetails()
{
    if (mode == "login")
    {
        user = document.getElementById("loginemail").value;
        password = document.getElementById("loginpassword").value;
        document.getElementById("hostslist").innerHTML = "";
        if (user && password)
        {
            filesystem.writeFile(__dirname + "\\userdata", user + "\n" + password, function(err)
            {
                if (err) console.log(err);
            });
            decryptHosts();
        }
    }
    if (mode == "register")
    {
        user = document.getElementById("registeremail").value;
        password = document.getElementById("registerpassword").value;
        if (user && password)
        {
            filesystem.writeFile(__dirname + "\\userdata", user + "\n" + password, function(err)
            {
                if (err) console.log(err);
            });
            decryptHosts();
        }
    }
}

function htmlEntities(str)
{
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

//#region reset buttons on login screen
function resetRegisterButton()
{
    document.getElementById("registerbtn").style.marginTop = "0px";
    document.getElementById("registerbtn").style.width = "80%";
    document.getElementById("registerbtn").innerHTML = "Login";
}



function resetLoginButton()
{
    document.getElementById("loginbtn").style.marginTop = "0px";
    document.getElementById("loginbtn").style.width = "80%";
    document.getElementById("loginbtn").innerHTML = "Login";
}



function resetButtons()
{
    document.getElementById("loginbtn").style.marginTop = "15px";
    document.getElementById("loginbtn").style.width = "80%";
    document.getElementById("loginbtn").innerHTML = "Login";
    document.getElementById("registerbtn").style.marginTop = "15px";
    document.getElementById("registerbtn").style.width = "80%";
    document.getElementById("registerbtn").innerHTML = "Register";
}
//#endregion


//#region show error messages on login screen
function showLoginMessage(displaytext)
{
    document.getElementById("loginmsg").innerHTML = displaytext;
    document.getElementById("loginmsg").style.display = "block";
    document.getElementById("loginbtn").style.marginTop = "0px";
}

function showRegisterMessage(displaytext)
{
    document.getElementById("registermsg").innerHTML = displaytext;
    document.getElementById("registermsg").style.display = "block";
    document.getElementById("registerbtn").style.marginTop = "0px";
}
//#endregion


// #region hide error messages on login screen
function hideLoginMessage()
{
    document.getElementById("loginmsg").innerHTML = "";
    document.getElementById("loginmsg").style.display = "none";
    document.getElementById("loginbtn").style.marginTop = "15px";
}


function hideRegisterMessage()
{
    document.getElementById("registermsg").innerHTML = "";
    document.getElementById("registermsg").style.display = "none";
    document.getElementById("registerbtn").style.marginTop = "15px";
}
// #endregion