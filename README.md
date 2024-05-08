![preview](/preview/preview.png)

# 🗿 TODOList

The TODO List module allows users to manage their tasks effectively. It provides functionalities to create, update, delete, and view tasks. Basically may contains only one user. All user tasks protected by password.
HTML/CSS support: style and structure your notes.
Browser mode: some links inserted as task descriptions can be opened and viewed directly from the application's web interface.

In development: possibility to use HTML, standalone mode.

There are plans to add multi-user capability, different encryption methods, registration in UI.

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
        "lang": "ru", /*Language of the interface*/
        "rewrite-config": true, /*Whether to overwrite log file*/
        "login": "login", /*User loging to protect your data*/
        "password": "password", /*User password to protect your data*/
        "key": "key" /*Secret key to hash password*/
    }
}
```

## ❗️ Future changes

Here you can see a list of TODO changes expected in upcoming commits:

- New interface design
- Mobile version
- Error pages
- json to jsonl
- Sort task on server
- Send one task instead of a full dump
- Standalone app


## 💼 Usage

1. Clone repo
2. Change configuration file
3. Install requarements from package.json
```sh
cd directory_name
npm install
```
This part is coming soon...

---

## ❗️ License

This project is licensed under the MIT License. See the LICENSE file for more information.