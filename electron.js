const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')

let python;

function createWindow () {
    let window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        }
    })  
    python = spawn('python', ['start.py'])   
    python.stdout.on('data', () => {
        window.loadURL('http://127.0.0.1:5000')
    }); 
    python.stderr.on('data', (data) => {
        console.error(`[server] Error: ${data}`);
    }); 
    python.on('close', (code) => {
        console.log(`[server] Exit: code ${code}`);
    });
}

process.on('exit', function () {
    python.kill();
});

process.on('SIGINT', function () {
    python.kill();
    process.exit();
});

app.whenReady().then(createWindow)