require('electron').remote.getCurrentWindow().show();

/**
 * Show the Login Screen
 */
tab1.click(function()
{
    registerpage.fadeOut(100, function()
    {
        tab1.addClass("selectedform");
        tab2.removeClass("selectedform");
        $("#loginpage").fadeIn(100);
    });
});


/**
 * Show the Register Screen
 */
tab2.click(function()
{
    $("#loginpage").fadeOut(100, function()
    {
        tab2.addClass("selectedform");
        tab1.removeClass("selectedform");
        registerpage.fadeIn(100);
    });
});


/**
 * Send a login request
 */
loginButton.addEventListener("click", function () {
    login(loginButton, loginemail.value, loginpassword.value);
});


/**
 * Send a register request
 */
registerbtn.addEventListener("click", function()
{
    register(registerbtn, registeremail.value, registerpassword.value);
});


/**
 * Skip the login section
 */
$("#skipaccount").click(function()
{
    $("#loginSignupPage").fadeOut(200);
});


/**
 * Log out
 */
$("#exitbtn").click(function()
{
    logout();
});


/**
 * Log out
 */
$("#navlogoutbarbtn").click(function()
{
    logout();
});