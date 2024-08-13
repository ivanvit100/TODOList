![preview](/preview/preview.png)

# 🗿 TODOList

The TODO List module allows users to manage their tasks effectively. It provides functionalities to create, update, delete, and view tasks. Basically may contains only one user. All user tasks protected by password.
HTML/CSS support: style and structure your notes.
Browser mode: some links inserted as task descriptions can be opened and viewed directly from the application's web interface.

## 🧭 Overview

This part is coming soon...

## 📥 Installation

### Complete package

Visit [Releases](https://github.com/ivanvit100/TODOList/releases) page and download app image for your OS. It may be deb or rpm package or zip/tar archive.

### From source

First of all, clone this repo

```sh
git clone https://github.com/ivanvit100/TODOList.git
```

Commands for compiling projects you can see in [package.json](/package.json):
```sh
npm run make
npm run make-zip
npm run make-linux
npm run make-darwin
npm run make-windows
```


## 🛠️ Configuration

### CLI method

You can customize your TODO application. To do this, fix the config.json file to your liking.

#### Config files path:
- /home/user/.todo/config.json
- C:/Program Files/todo/config.json

#### Example of config structure:

```json
{
    /*App settings*/
    "todo": {
        "color-date-alert": true, /* Whether to include styles for expired date of task notification */
        "lang": "ru", /* Language of the interface */
        "theme": "light", /* Application start theme, supports “light” and “dark” variants */
        "sort-order": "alphabet", /* Sort order of task list */
        "login": "login", /* User loging to protect your data */
        "password": "password", /* User password to protect your data */
        "key": "key" /* Secret key to hash password */
    }
}
```

### UI method

To setup your task list as you wish you can follow these steps:
1. Open TODOList app
2. Click 'Alt' button on your keyboard
3. Select 'Menu' > 'Settings'
4. Log in to your account
5. Change parameters
6. Click 'Save'
7. Reload app to ensure that changes was applied 

### More information

#### Avaliable langs:
- Russian - ru
- English - us

#### Avaliable sorts:
- alphabet
- priority
- date
- count (in development)

Also you can left login and password empty to use app without authtorisation.

## 📝 Future changes

Here you can see a list of TODO changes expected in upcoming commits:

- New interface design
- json to jsonl
- Send one task instead of a full dump
- Multi-user capability
- Different encryption methods, 
- Registration in UI

## 💼 Usage

This part is coming soon...

## ❗️ License

This project is licensed under the MIT License. See the [LICENSE](/LICENSE) file for more information.