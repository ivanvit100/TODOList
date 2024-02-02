# Description: Main file for start server
# This file is part of the "Todo" module for "Skizo" project
# Author: ivanvit100 @ GitHub
# Licence: MIT

import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# TODO: Add config validation
# TODO: Add alternative way to save settings
# TODO: Add logging
# TODO: Add sessions


# Load config
# Input: config.json
# Output: user = {
#   'enabled': bool,
#   'web': bool,
#   'login': string,
#   'password': string,
#   'host': string
# }
with open('config.json', 'r') as file:
    data = json.load(file)
user = data['todo']

# Function to send index.html to the client
# Input: /
# Output: index.html (from /public)
@app.route('/')
def home():
    return send_from_directory('./public', 'index.html')

# Function to send config to the client
# Automatically excludes login and password from issuance
# Input: none
# Output: status: string, message: object
@app.route('/api/config', methods=['POST'])
def getConfig():
    data = user.copy()
    data.pop('login', None)
    data.pop('password', None)
    response = {
        'status': 'success',
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
        response = {
            'status': 'success',
            'message': 'Данные загружаются'
        }
    else:
        response = {
            'status': 'error',
            'message': 'Неверный логин или пароль'
        }
    return jsonify(response)

# Get data of taskList (array of tasks)
# Input: login: string, password: string, taskList: string
# Output: status: string, data: array | message: string
# login and password are used for additional verification
@app.route('/api/getTaskList', methods=['POST'])
def getTaskList():
    requestData = request.get_json()
    if requestData["login"] == user['login'] and requestData["password"] == user['password']:
        with open(f'./server/taskManager/{requestData["taskList"]}.json', 'r') as file:
            data = json.load(file)
        response = {
            'status': 'success',
            'message': data
        }
    else:
        response = {
            'status': 'error',
            'message': 'Неверный логин или пароль'
        }
    return jsonify(response)

# Get list of taskLists (array of taskLists)
# Input: login: string, password: string
# Output: status: string, data: array | message: string
# login and password are used for additional verification
@app.route('/api/getTaskListList', methods=['POST'])
def getTaskListList():
    requestData = request.get_json()
    if requestData["login"] == user['login'] and requestData["password"] == user['password']:
        files = os.listdir('./server/taskManager')
        data = [os.path.splitext(file)[0] for file in files if file.endswith('.json')]
        response = {
            'status': 'success',
            'message': data
        }
    else:
        response = {
            'status': 'error',
            'message': 'Неверный логин или пароль'
        }
    return jsonify(response)

# Save data of taskList (array of tasks)
# Can be used for updating information about one task
# or for creating a new taskList
# Input: login: string, password: string, taskList: string, data: object
# Output: status: string, message: string
@app.route('/api/saveTaskList', methods=['POST'])
def saveTaskList():
    requestData = request.get_json()
    if requestData["login"] == user['login'] and requestData["password"] == user['password']:
        with open(f'./server/taskManager/{requestData["taskList"]}.json', 'w') as file:
            json.dump(requestData["data"], file)
        response = {
            'status': 'success',
            'message': 'Данные сохранены'
        }
    else:
        response = {
            'status': 'error',
            'message': 'Неверный логин или пароль'
        }
    return jsonify(response)

# Function to delete taskList
# Its will delete /server/taskManager/{taskList}.json
# Input: login: string, password: string, taskList: string
# Output: status: string, message: string
@app.route('/api/deleteList', methods=['POST'])
def deleteList():
    data = request.get_json()
    if data['login'] == user['login'] and data['password'] == user['password']:
        taskList = data['taskList']
        try:
            os.remove(f"./server/taskManager/{taskList}.json")
            response = {
                'status': 'success',
                'message': 'Удаление успешно'
            }
        except Exception:
            response = {
                'status': 'error',
                'message': 'Ошибка удаления'
            }
    else:
        response = {
            'status': 'error',
            'message': 'Неверный логин или пароль'
        }
    return jsonify(response)

# Redirecting links for public files (css, js, icons etc) 
# Will be used if the web interface is enabled
# Input: filename: string
# Output: file (from /public)
if user['web']:
    @app.route('/public/<path:filename>')
    def custom_static(filename):
        return send_from_directory('./public/', filename)

# Redirecting unknown links
# Input: path: string
# Output: 404.html (from /public)
#         or text (if web interface is disabled) 
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if not user['web']:
        return f'Вы попали на URL: {path}'
    else:
        return send_from_directory('./public/', '404.html')

if __name__ == '__main__':
    app.run(debug=True)