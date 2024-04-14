const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')

function createWindow () {
    let window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        }
    })  
    window.loadURL('http://localhost:5000')    
    const python = spawn('python', ['start.py'])   
    python.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    }); 
    python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    }); 
    python.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

app.whenReady().then(createWindow)