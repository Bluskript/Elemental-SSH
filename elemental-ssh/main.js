// Modules to control application life and create native browser window
const {app} = require("electron");
const splash = require("@trodi/electron-splashscreen");
//app.disableHardwareAcceleration();
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow()
{
    mainWindow = splash.initDynamicSplashScreen(
        {
            windowOpts: {width: 1408, height: 792, webPreferences: {nodeIntegration: true}, icon: "icon.png"},
            templateUrl: __dirname + "\\splash.html",
            splashScreenOpts: {
                width: 300,
                height: 300,
                movable: true,
                webPreferences: {nodeIntegration: true},
                icon: "icon.png"
            }
        });
    mainWindow.main.loadFile("index.html");
    mainWindow.main.setMenuBarVisibility(false);

    mainWindow.main.on("closed", function () {
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function ()
{
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin")
    {
        app.quit();
    }
});

app.on("activate", function ()
{
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null)
    {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.