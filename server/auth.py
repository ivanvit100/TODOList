import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/auth', methods=['POST'])
def auth():
    data = request.get_json()
    response = {
        'status': 'success',
        'message': 'POST request processed',
        'data': data
    }
    return jsonify(response)

@app.route('/api/getTaskList', methods=['POST'])
def getTaskList():
    requestData = request.get_json()
    with open('./taskManager/Продукты.json', 'r') as file:
        data = json.load(file)
    response = {
        'status': 'success',
        'data': data,
        'name': 'Продукты'
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)