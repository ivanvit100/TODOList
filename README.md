![preview](/preview/preview.png)

# 🗿 TODOList

The TODO List module allows users to manage their tasks effectively. It provides functionalities to create, update, delete, and view tasks. Basically may contains only one user. All user tasks protected by password.
HTML/CSS support: style and structure your notes.
Browser mode: some links inserted as task descriptions can be opened and viewed directly from the application's web interface.

There are plans to add multi-user capability, different encryption methods, registration in UI.

## Overview

This part is coming soon...

## 📥 Installation

This part is coming soon...

## 🛠️ Configuration

You can customize your TODO application. To do this, fix the config.json file to your liking.

Example of config structure:

```json
{
    /*App settings*/
    "todo": {
        "color-date-alert": true, /*Whether to include styles for expired date of task notification*/
        "custom-menu": true, /*Using default electron menu or custom, written on html*/
        "lang": "ru", /*Language of the interface*/
        "login": "login", /*User loging to protect your data*/
        "password": "password", /*User password to protect your data*/
        "key": "key" /*Secret key to hash password*/
    }
}
```

Avaliable langs:
- Russian - ru
- English - us

Also you can left login and password empty to use app without authtorisation.

## ❗️ Future changes

Here you can see a list of TODO changes expected in upcoming commits:

- New interface design
- json to jsonl
- Send one task instead of a full dump

## 💼 Usage

This part is coming soon...

---

## ❗️ License

This project is licensed under the MIT License. See the LICENSE file for more information.