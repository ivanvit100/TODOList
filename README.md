![preview](/preview/preview.png)

# 🗿 TODOList

This repository contains the TODO List module for the [Skizo](https://github.com/BlackRavenoo/Skizo) project. The module is a web interface written in TypeScript with a server-side component built using Flask.

## 🌐 Features

The TODO List module allows users to manage their tasks effectively. It provides functionalities to create, update, delete, and view tasks. Basically may contains only one user. All user tasks protected by password.

There are plans to add multi-user capability, different encryption and data storage methods.

## 📥 Installation

To run this module as part of the bot, you need to enable the TODO module and the web interface module in the configuration. You also need put this repository in the Modules directory of [Skizo](https://github.com/BlackRavenoo/Skizo) project. 

The dependencies of this project include:
- Python 3.10.13
- Flask 3.0.1
- Werkzeug 3.0.1
- Additional dependencies (such as aiogram) provided by the [Skizo](https://github.com/BlackRavenoo/Skizo) project 

Installation guide: 
```sh
cd ./Skizo/src/modules

git clone https://github.com/ivanvit100/TODOList_Skizo.git

mv TODOList_Skizo todo
```

### Standalone Mode

The TODO List module can also be run on a local machine in standalone mode. This allows for development and testing outside of the full [Skizo](https://github.com/BlackRavenoo/Skizo) project or using it as personal TODO web app without additional functions.
To start it You should run start.py file.
```sh
cd ./Skizo/src/modules

git clone https://github.com/ivanvit100/TODOList_Skizo.git

cd TODOList_Skizo

python start.py
```

## 🛠️ Configuration

You can customize your TODO application. To do this, fix the config.json file to your liking.

Example of config structure:

```json
{
    /*TODO app settings*/
    "todo": {
        "enabled": true, /*For use as part of Skizo: whether to include the module functionality in the overall build*/
        "web": true, /*Whether to include the web interface*/
        "login": "login", /*User loging to protect your data*/
        "password": "password", /*User password to protect your data*/
        "host": "http://localhost:5000" /*Host to run the web interface on (in development)*/
    }
}
```

## 💼 Usage

Once the module is enabled in the configuration, you can start using the TODO List through the Skizo project's web interface or with Your Telegram bot.

---

## ❗️ License

This project is licensed under the MIT License. See the LICENSE file for more information.
