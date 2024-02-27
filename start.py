# Description: Main file for start server
# This file is part of the "Todo" module for "Skizo" project
# Author: ivanvit100 @ GitHub
# Licence: MIT

import os
import json
import logging
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Load config or create new one
# Input: config.json
# Output: user = {
#   'enabled': bool,
#   'web': bool,
#   'color-date-alert': bool,
#   'lang': string,
#   'rewrite-config': bool,
#   'login': string,
#   'password': string,
#   'key': string
# }
try:
    with open('config.json', 'r') as file:
        data = json.load(file)
    user = data['todo']
    if ['enabled', 'web', 'color-date-alert', 'lang', 'rewrite-config', 'login', 'password', 'key'] != list(user.keys()):
        raise Exception
    app.secret_key = user['key']
except Exception:
    user = {
        'enabled': True,
        'web': True,
        'color-date-alert': True,
        'lang': 'ru',
        'rewrite-config': True,
        'login': 'admin',
        'password': 'admin',
        'key': 'secret'
    }
    with open('config.json', 'w') as file:
        json.dump({'todo': user}, file)
    logging.error(f'[{datetime.now()}][setup]: Error reading config file, default settings are used')

# Load language file
# If the file is not found, the default language will be used
# Default language is "ru"
# Input: /server/langs/lang.{user["lang"]}.json
# Output: lang = {...}
try:
    with open(f'./server/langs/lang.{user["lang"]}.json', 'r') as file:
        lang = json.load(file)
    with open(f'./server/langs/client.{user["lang"]}.json', 'r') as file:
        clientLang = json.load(file)
except Exception:
    with open('/server/langs/lang.ru.json', 'r') as file:
        lang = json.load(file)
    with open('./server/langs/client.ru.json', 'r') as file:
        clientLang = json.load(file)
    logging.error(f'[{datetime.now()}][setup]: Error reading lang file, default settings are used')

# Logging settings
# Will rewrite the log file with every start of the server
# or creating new log file on every launch
logging.basicConfig(filename=f'./server/logs/log{not user["rewrite-config"] and "-" + str(datetime.now().date()) or "-main"}.log',
                    level=logging.INFO,
                    filemode='w' if user['rewrite-config'] else 'a')
logging.info(f'[{datetime.now()}][setup]: App strtarted with config {user}')

# Function to send index.html to the client
# Will be used if the web interface is enabled
# Input: /
# Output: index.html (from /public)
if user['web']:
    @app.route('/')
    def home():
        return send_from_directory('./public', 'index.html')

# Function to send config to the client
# Automatically excludes login and password from issuance
# Input: none
# Output: status: string, message: object
@app.route('/api/config', methods=['POST'])
def getConfig():
    data = {
        'color-date-alert': user['color-date-alert'],
        'lang': clientLang
    }
    response = {
        'status': 'success',
        'login': session['login'] if 'login' in session else False,
        'message': data
    }
    return jsonify(response)

# Main user authentification
# Called by the client for the purpose of initial verification 
# and further request of taskList's list
# Input: login: string, password: string
# Output: status: string, message: string
# "status" is an additional class of the notification window on the client side
# It can be "success", "error" or "info"
# "message" is the text of the notification window on the client side 
@app.route('/api/auth', methods=['POST'])
def auth():
    data = request.get_json()
    if data['login'] == user['login'] and data['password'] == user['password']:
        session['login'] = data['login']
        response = {
            'status': 'success',
            'message': lang['auth-success']
        }
    else:
        response = {
            'status': 'error',
            'message': app.secret_key#lang['auth-error']
        }
    logging.warning(f'[{datetime.now()}][auth]: New authentification {response["status"]}')
    return jsonify(response)

# Get data of taskList (array of tasks)
# Input: login: string, password: string, taskList: string
# Output: status: string, data: array | message: string
# login and password are used for additional verification
@app.route('/api/getTaskList', methods=['POST'])
def getTaskList():
    requestData = request.get_json()
    if 'login' in session and session['login'] == session['login']:
        try:
            with open(f'./server/taskManager/{requestData["taskList"]}.json', 'r') as file:
                data = json.load(file)
            response = {
                'status': 'success',
                'message': data
            }
        except Exception:
            logging.error(f'[{datetime.now()}][getTaskList]: Error reading file "{requestData["taskList"]}.json"')
            response = {
                'status': 'error',
                'message': lang['file-error']
            }
    else:
        response = {
            'status': 'error',
            'message': lang['auth-error']
        }
        logging.warning(f'[{datetime.now()}][getTaskList]: Error authentification')
    return jsonify(response)

# Get list of taskLists (array of taskLists)
# Input: login: string, password: string
# Output: status: string, data: array | message: string
# login and password are used for additional verification
@app.route('/api/getTaskListList', methods=['POST'])
def getTaskListList():
    if 'login' in session and session['login'] == session['login']:
        files = os.listdir('./server/taskManager')
        try:
            data = [os.path.splitext(file)[0] for file in files if file.endswith('.json')]
            response = {
                'status': 'success',
                'message': data
            }
        except Exception:
            logging.error(f'[{datetime.now()}][getTaskListList]: Error reading files')
            response = {
                'status': 'error',
                'message': lang['file-error']
            }
    else:
        response = {
            'status': 'error',
            'message': lang['auth-error']
        }
        logging.warning(f'[{datetime.now()}][getTaskListList]: Error authentification')
    return jsonify(response)

# Save data of taskList (array of tasks)
# Can be used for updating information about one task
# or for creating a new taskList
# Input: login: string, password: string, taskList: string, data: object
# Output: status: string, message: string
@app.route('/api/saveTaskList', methods=['POST'])
def saveTaskList():
    requestData = request.get_json()
    if 'login' in session and session['login'] == session['login']:
        try:
            with open(f'./server/taskManager/{requestData["taskList"]}.json', 'w') as file:
                json.dump(requestData["data"], file)
                response = {
                    'status': 'success',
                    'message': lang['save-success']
                }
        except Exception:
            logging.error(f'[{datetime.now()}][saveTaskList]: Error saving file "{requestData["taskList"]}.json"')
            response = {
                'status': 'error',
                'message': lang['save-error']
            }
    else:
        response = {
            'status': 'error',
            'message': lang['auth-error']
        }
        logging.warning(f'[{datetime.now()}][saveTaskList]: Error authentification')
    return jsonify(response)

# Function to delete taskList
# Its will delete /server/taskManager/{taskList}.json
# Input: login: string, password: string, taskList: string
# Output: status: string, message: string
@app.route('/api/deleteList', methods=['POST'])
def deleteList():
    data = request.get_json()
    if 'login' in session and session['login'] == session['login']:
        taskList = data['taskList']
        try:
            os.remove(f"./server/taskManager/{taskList}.json")
            response = {
                'status': 'success',
                'message': lang['delete-success']
            }
        except Exception:
            logging.error(f'[{datetime.now()}][deleteList]: Error deleting file "{taskList}.json"')
            response = {
                'status': 'error',
                'message': lang['delete-error']
            }
    else:
        response = {
            'status': 'error',
            'message': lang['auth-error']
        }
        logging.warning(f'[{datetime.now()}][deleteList]: Error authentification')
    return jsonify(response)

# Redirecting links for public files (css, js, icons etc) 
# Will be used if the web interface is enabled
# Input: filename: string
# Output: file (from /public)
if user['web']:
    @app.route('/public/<path:filename>')
    def custom_static(filename):
        try:
            return send_from_directory('./public/', filename)
        except Exception:
            logging.error(f'[{datetime.now()}][path]: Error reading file "{filename}"')
            return send_from_directory('./public/', '404.html')

# Redirecting unknown links
# Input: path: string
# Output: 404.html (from /public)
#         or text (if web interface is disabled) 
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    logging.warning(f'[{datetime.now()}][path]: Unlnown path "{path}" catched')
    if not user['web']:
        return f'{lang["unknown-url"]} {path}'
    else:
        return send_from_directory('./public/', '404.html')

if __name__ == '__main__':
    app.run(debug=True)