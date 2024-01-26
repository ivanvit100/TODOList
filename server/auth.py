import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

user = {
    'login': 'asd',
    'password': 'asd'
}

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

@app.route('/api/getTaskList', methods=['POST'])
def getTaskList():
    requestData = request.get_json()
    if requestData["login"] == user['login'] and requestData["password"] == user['password']:
        with open(f'./taskManager/{requestData["taskList"]}.json', 'r') as file:
            data = json.load(file)
        response = {
            'status': 'success',
            'data': data
        }
    else:
        response = {
            'status': 'error',
            'message': 'Неверный логин или пароль'
        }
    return jsonify(response)

@app.route('/api/getTaskListList', methods=['POST'])
def getTaskListList():
    requestData = request.get_json()
    if requestData["login"] == user['login'] and requestData["password"] == user['password']:
        files = os.listdir('./taskManager')
        data = [os.path.splitext(file)[0] for file in files if file.endswith('.json')]
        response = {
            'status': 'success',
            'data': data
        }
    else:
        response = {
            'status': 'error',
            'message': 'Неверный логин или пароль'
        }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)