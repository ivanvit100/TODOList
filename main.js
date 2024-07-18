// Description: Main file for start server
// This file is part of the "Todo app" project
// Author: ivanvit100 @ GitHub
// Licence: MIT

const { app, BrowserWindow, shell, Menu, nativeImage, ipcMain } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');

let user;
let programFilesPath;
let lang;
let clientLang;

// Prepare directories and files
// If the directories and files are not found, they will be created
// Input: none
// Output: none
if (os.platform() === 'win32') 
    programFilesPath = 'C:\\Program Files\\todo\\';
else if (os.platform() === 'linux')
    programFilesPath = path.join(os.homedir(), '.todo/');

// Create log file
// Input: none
// Output: log.txt
const logPath = path.join(programFilesPath, 'log.txt');
fs.open(logPath, 'w', (err, file) => {
    if (err) throw err;
    console.log('[server] Logging started');
});

// Function to write logs
// Input: message: string, type: string
// Output: none
function setLog(message, caller = 'server', type = 'info') {
    const time = new Date().toISOString();
    const content = `[${time}][${type}][${caller}] ${message}\n`;
    fs.appendFile(logPath, content, (err) => {
        if (err) throw err;
    });
}

const filePath = path.join(programFilesPath, 'taskManager/default.json');
const fileDir = path.dirname(filePath);
if (!fs.existsSync(programFilesPath))
    fs.mkdirSync(programFilesPath, { recursive: true });
if (!fs.existsSync(fileDir))
    fs.mkdirSync(fileDir, { recursive: true });

if (!fs.existsSync(filePath))
    fs.writeFileSync(filePath, '{"data":[{"name":"GitHub","done":false,"description":"https://github.com/ivanvit100/TODOList","date":null,"lvl":9}]}', 'utf8');
    
// Load config or create new one
// Input: config.json
// Output: user = {
//   'color-date-alert': bool,
//   'custom-menu': bool,
//   'lang': string,
//   'login': string,
//   'password': string,
//   'key': string
// }
try {
    const data = JSON.parse(fs.readFileSync(path.join(programFilesPath, 'config.json')));
    user = data['todo'];
    if (!['color-date-alert', 'lang', 'login', 'password', 'key'].every(key => key in user)) {
        throw new Error();
    }
} catch (error) {
    user = {
        'color-date-alert': true,
        'lang': 'ru',
        'login': 'admin',
        'password': 'admin',
        'key': 'secret'
    };
    fs.writeFileSync(path.join(programFilesPath, 'config.json'), JSON.stringify({todo: user}));
    setLog('Error reading config file, default settings are used', "Error");
}
    
// Load language file
// If the file is not found, the default language will be used
// Default language is "ru"
// Input: /server/langs/lang.{user["lang"]}.json
// Output: lang = {...}
try {
    lang = JSON.parse(fs.readFileSync(`${__dirname}/server/langs/lang.${user["lang"]}.json`));
    clientLang = JSON.parse(fs.readFileSync(`${__dirname}/server/langs/client.${user["lang"]}.json`));
} catch (error) {
    lang = JSON.parse(fs.readFileSync(`${__dirname}/server/langs/lang.ru.json`));
    clientLang = JSON.parse(fs.readFileSync(`${__dirname}/server/langs/client.ru.json`));
    setLog('Error reading lang file, default settings are used', "Error");
}

// Create an express application
// Use the express.json() middleware to parse JSON data
var encoder = bodyParser.json();
const expressApp = express();
expressApp.use(express.json());
expressApp.use(session({
    secret: user['key'],
    resave: false,
    saveUninitialized: true
}));

// Path to static files
// Input: /public/{filename} (string)
// Output: {filename} (file))
expressApp.get('/public/:filename', encoder, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', req.params.filename), err => {
        if (err) {
            setLog(`Error reading file "${req.params.filename}"`, "filepath", "Error");
            res.sendFile(path.join(__dirname, 'public', '404.html'));
        }
    });
});

// Main user authentification
// Called by the client for the purpose of initial verification 
// and further request of taskList's list
// Input: login: string, password: string
// Output: status: string, message: string
// "status" is an additional class of the notification window on the client side
// It can be "success", "error" or "info"
// "message" is the text of the notification window on the client side
expressApp.post('/api/auth', encoder, (req, res) => {
    const data = req.body;
    let response;
    if ((data['login'] == user['login'] && data['password'] == user['password']) || (user['login'].length == 0) || getCookie(req, 'login')){
        res.setHeader('Set-Cookie', `login=${data['login']}; Max-Age=900000; HttpOnly; SameSite=None; Secure`);
        response = {
            'status': 'success',
            'message': lang['auth-success']
        };
    } else if(data['login'].length != 0) {
        response = {
            'status': 'error',
            'message': lang['auth-error']
        };
    }
    res.send(response);
});

// Get settings of user
// Input: login: string, password: string
// Output: status: string, message: object
expressApp.post('/api/getSettings', (req, res) => {
    let response;
    if (getCookie(req, 'login')) {
        response = {
            'status': 'success',
            'message': user
        };
    } else {
        response = {
            'status': 'error',
            'message': lang['auth-error']
        };
        setLog('Error authentication', "Warning");
    }
    res.json(response);
});

// Set settings of user
// Input: login: string, password: string, settings: object
// Output: status: string, message: string
expressApp.post('/api/setSettings', (req, res) => {
    const data = req.body;
    let response;
    if (getCookie(req, 'login')) {
        user = data;
        fs.writeFileSync(path.join(programFilesPath, 'config.json'), JSON.stringify({todo: data}));
        response = {
            'status': 'success',
            'message': lang['save-success']
        };
    } else {
        response = {
            'status': 'error',
            'message': lang['auth-error']
        };
        setLog('Error authentication', "Warning");
    }
    res.json(response);
});

// Get data of taskList (array of tasks)
// Input: login: string, password: string, taskList: string
// Output: status: string, data: array | message: string
// login and password are used for additional verification
expressApp.post('/api/getTaskList', (req, res) => {
    const requestData = req.body;
    let response;
    if (getCookie(req, 'login')) {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(programFilesPath, `taskManager/${requestData["taskList"]}.json`)));
            response = {
                'status': 'success',
                'message': data
            };
        } catch (error) {
            setLog(`Error reading file "${requestData["taskList"]}.json"`, "getTaskList", "Error");
            response = {
                'status': 'error',
                'message': lang['file-error']
            };
        }
    } else {
        response = {
            'status': 'error',
            'message': lang['auth-error']
        };
        setLog('Error authentication', "Warning");
    }
    res.json(response);
});

// Get list of taskLists (array of taskLists)
// Input: login: string, password: string
// Output: status: string, data: array | message: string
// login and password are used for additional verification
expressApp.post('/api/getTaskListList', (req, res) => {
    let response;
    if(getCookie(req, 'login')){
        try {
            const files = fs.readdirSync(path.join(programFilesPath, 'taskManager'));
            const data = files.filter(file => file.endsWith('.json')).map(file => path.basename(file, '.json'));
            response = {
                'status': 'success',
                'message': data
            };
        } catch (error) {
            setLog('Error reading files', "getTaskListList", "Error");
            response = {
                'status': 'error',
                'message': lang['file-error']
            };
        }
    } else {
        response = {
            'status': 'error',
            'message': lang['auth-error']
        };
        setLog('Error authentication', "Warning");
    }
    res.json(response);
});

// Save data of taskList (array of tasks)
// Can be used for updating information about one task
// or for creating a new taskList
// Input: login: string, password: string, taskList: string, data: object
// Output: status: string, message: string
expressApp.post('/api/saveTaskList', (req, res) => {
    const requestData = req.body;
    let response;
    if (getCookie(req, 'login')) {
        try {
            fs.writeFileSync(`${programFilesPath}/taskManager/${requestData["taskList"]}.json`, JSON.stringify(requestData["data"]));
            response = {
                'status': 'success',
                'message': lang['save-success']
            };
        } catch (error) {
            setLog(`Error saving file "${requestData["taskList"]}.json because of "${error}"`, "saveTaskList", "Error");
            response = {
                'status': 'error',
                'message': lang['save-error']
            };
        }
    } else {
        response = {
            'status': 'error',
            'message': lang['auth-error']
        };
        setLog('Error authentication', "Warning");
    }
    res.json(response);
});

// Function to delete taskList
// Its will delete /taskManager/{taskList}.json
// Input: login: string, password: string, taskList: string
// Output: status: string, message: string
expressApp.post('/api/deleteList', (req, res) => {
    const data = req.body;
    let response;
    if (getCookie(req, 'login')) {
        const taskList = data['taskList'];
        try {
            fs.unlinkSync(path.join(programFilesPath,`taskManager/${taskList}.json`));
            response = {
                'status': 'success',
                'message': lang['delete-success']
            };
        } catch (error) {
            setLog(`Error deleting file "${taskList}.json"`, "deleteList", "Error");
            response = {
                'status': 'error',
                'message': lang['delete-error']
            };
        }
    } else {
        response = {
            'status': 'error',
            'message': lang['auth-error']
        };
        setLog('Error authentication', "Warning");
    }
    res.json(response);
});

// Path responsible for non-existent routes
// Input: none
// Output: 404.html
expressApp.get('*', (req, res) => {
    setLog(`Unknown path "${req.path}" catched`, "Warning");
    res.sendFile(path.join(__dirname, 'public', '404.html'));
});

// Creating an application, launching a viewer window
// and setting up a menu
// The server is started on port random empty port
// Input: none
// Output: none
const server = expressApp.listen(0, () => setLog(`Server started on port ${server.address().port}`));
app.whenReady().then(() => {
    const window = new BrowserWindow({
        width: 1280,
        height: 720,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nativeWindowOpen: true,
            webviewTag: true,
            enableRemoteModule: true
        }
    });
    window.loadFile("./public/index.html");
    Menu.setApplicationMenu(null);
    let isMenuVisible = false;
    const menu = Menu.buildFromTemplate([
        {
            label: lang['menu'],
            icon: nativeImage.createFromPath(path.join(__dirname, './public/icons/todo.png')),
            submenu: [
                { label: lang['home'], click: () => { window.loadFile("./public/index.html"); } },
                { label: lang['settings'], click: () => { window.loadFile("./public/settings.html"); } },
                { label: lang['files'], click: () => { shell.openPath(programFilesPath); } },
                { label: lang['reload'], click: () => { window.reload(); } },
                { label: lang['logout'], click: () => {
                    server.close();
                    app.quit();
                } }
            ]
        }, {
            label: lang['help'],
            submenu: [
                { label: 'Q&A', click: () => { shell.openExternal('https://github.com/ivanvit100/TODOList/discussions/categories/q-a'); } },
                { label: 'GitHub', click: () => { shell.openExternal('https://github.com/ivanvit100/TODOList'); } },
                { label: lang['developer'], click: () => { shell.openExternal('https://ivanvit.ru'); } }
            ]
        }
    ]);
    window.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'Alt' && input.type === 'keyDown') {
            isMenuVisible = !isMenuVisible;
            if (isMenuVisible) Menu.setApplicationMenu(menu);
            else Menu.setApplicationMenu(null);
            event.preventDefault();
        }
    });
    // window.webContents.openDevTools();
    window.webContents.on('did-finish-load', () => {
        const data = {
            'port': server.address().port,
            'color-date-alert': user['color-date-alert'],
            'lang': clientLang
        };
        window.webContents.send('config', data);
        ipcMain.on('set-cookie', (event, data) => {
        window.webContents.session.cookies.set(data)
            .then(() => console.log('Cookie set'))
            .catch(error => console.log(`Failed to set cookie: ${error}`));
        });
    });
    window.on('blur', () => {
        Menu.setApplicationMenu(null)
    })
});

// Closing the application
// Input: none
// Output: none
app.on('window-all-closed', () => {
    server.close();
    app.quit();
});

// Function to get cookie and validate it
// Input: req: object, name: string
// Output: bool
getCookie = (req, name) => {
    const cookies = req.headers.cookie ? req.headers.cookie.split('; ').reduce((prev, current) => {
        const [name, value] = current.split('=');
        prev[name] = value;
        return prev;
    }, {}) : {};
    return cookies[name] == user[name];
}