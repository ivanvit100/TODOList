// Description: Main file for start server
// This file is part of the "Todo" module for "Skizo" project
// Author: ivanvit100 @ GitHub
// Licence: MIT

const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');

// TODO: logging

// Load config or create new one
// Input: config.json
// Output: user = {
//   'color-date-alert': bool,
//   'lang': string,
//   'rewrite-config': bool,
//   'login': string,
//   'password': string,
//   'key': string
// }
let user;
try {
    const data = JSON.parse(fs.readFileSync('config.json'));
    user = data['todo'];
    if (!['color-date-alert', 'lang', 'rewrite-config', 'login', 'password', 'key'].every(key => key in user)) {
        throw new Error();
    }
} catch (error) {
    user = {
        'color-date-alert': true,
        'lang': 'ru',
        'rewrite-config': true,
        'login': 'admin',
        'password': 'admin',
        'key': 'secret'
    };
    fs.writeFileSync('config.json', JSON.stringify({todo: user}));
    console.error('Error reading config file, default settings are used');
}
    
// Load language file
// If the file is not found, the default language will be used
// Default language is "ru"
// Input: /server/langs/lang.{user["lang"]}.json
// Output: lang = {...}
let lang;
let clientLang;
try {
    lang = JSON.parse(fs.readFileSync(`${__dirname}/server/langs/lang.${user["lang"]}.json`));
    clientLang = JSON.parse(fs.readFileSync(`${__dirname}/server/langs/client.${user["lang"]}.json`));
} catch (error) {
    lang = JSON.parse(fs.readFileSync(`${__dirname}/server/langs/lang.ru.json`));
    clientLang = JSON.parse(fs.readFileSync(`${__dirname}/server/langs/client.ru.json`));
    console.error('Error reading lang file, default settings are used');
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
            console.error(`[path]: Error reading file "${req.params.filename}"`);
            res.sendFile(path.join(__dirname, 'public', '404.html'));
        }
    });
});

// Function to send config to the client
// Automatically excludes login and password from issuance
// Input: none
// Output: status: string, message: object
expressApp.post('/api/config',  encoder, (req, res) => {
    const data = {
        'color-date-alert': user['color-date-alert'],
        'lang': clientLang
    };
    const response = {
        'status': 'success',
        'login': req.session && req.session.login ? req.session.login : false,
        'message': data
    };
    res.json(response);
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

// Get data of taskList (array of tasks)
// Input: login: string, password: string, taskList: string
// Output: status: string, data: array | message: string
// login and password are used for additional verification
expressApp.post('/api/getTaskList', (req, res) => {
    const requestData = req.body;
    let response;
    if (getCookie(req, 'login')) {
        try {
            const data = JSON.parse(fs.readFileSync(`./server/taskManager/${requestData["taskList"]}.json`));
            response = {
                'status': 'success',
                'message': data
            };
        } catch (error) {
            console.error(`[getTaskList]: Error reading file "${requestData["taskList"]}.json"`);
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
        console.warn('[getTaskList]: Error authentication');
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
            const files = fs.readdirSync('./server/taskManager');
            const data = files.filter(file => file.endsWith('.json')).map(file => path.basename(file, '.json'));
            response = {
                'status': 'success',
                'message': data
            };
        } catch (error) {
            console.error('[getTaskListList]: Error reading files');
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
        console.warn('[getTaskListList]: Error authentication');
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
            fs.writeFileSync(`./server/taskManager/${requestData["taskList"]}.json`, JSON.stringify(requestData["data"]));
            response = {
                'status': 'success',
                'message': lang['save-success']
            };
        } catch (error) {
            console.error(`[saveTaskList]: Error saving file "${requestData["taskList"]}.json"`);
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
        console.warn('[saveTaskList]: Error authentication');
    }
    res.json(response);
});

// Function to delete taskList
// Its will delete /server/taskManager/{taskList}.json
// Input: login: string, password: string, taskList: string
// Output: status: string, message: string
expressApp.post('/api/deleteList', (req, res) => {
    const data = req.body;
    let response;
    if (req.session && req.session.login === user['login']) {
        const taskList = data['taskList'];
        try {
            fs.unlinkSync(`./server/taskManager/${taskList}.json`);
            response = {
                'status': 'success',
                'message': lang['delete-success']
            };
        } catch (error) {
            console.error(`[deleteList]: Error deleting file "${taskList}.json"`);
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
        console.warn('[deleteList]: Error authentication');
    }
    res.json(response);
});

// Path responsible for non-existent routes
// Input: none
// Output: 404.html
expressApp.get('*', (req, res) => {
    console.warn(`[path]: Unknown path "${req.path}" catched`);
    res.sendFile(path.join(__dirname, 'public', '404.html'));
});

// Creating an application and launching a viewer window
// The server is started on port 3000
// Input: none
// Output: none
const server = expressApp.listen(3000, () => console.log('Server started on port 3000'));
app.whenReady().then(() => {
    const window = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            nativeWindowOpen: true,
            webviewTag: true,
            enableRemoteModule: true
        }
    });
    
    window.loadFile("./public/index.html");
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