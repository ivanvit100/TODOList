# 🗿 TODOList

![preview](/preview/1.png)

Example of a browser mode in task UI

![preview](/preview/2.png)

Example of a task with an expiring deadline

![preview](/preview/3.png)

Example of a mobile view

![preview](/preview/4.png)

Example of a settings menu

## 🧭 Overview

TODOList is a task management application built with TypeScript, Electron, and Express. It allows users to manage their tasks with features such as sorting, filtering, and prioritizing tasks. The application supports multiple languages and themes, and it is designed to be secure with password protection for user data. A unique feature of the application is a built-in HTML/CSS editor and the ability to view web pages on the task screen.

## 📥 Installation

### Complete package

Visit [Releases](https://github.com/ivanvit100/TODOList/releases) page and download app image for your OS. It may be deb or rpm package or zip/tar archive.

### From source

First of all, clone this repo

```sh
git clone https://github.com/ivanvit100/TODOList.git
```

Then, navigate to the project directory and install the dependencies:

```sh
cd TODOList
npm install
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
- count

Also you can left login and password empty to use app without authtorisation.

## 📝 Future changes

Here you can see a list of TODO changes expected in upcoming commits:

- New interface design
- json to jsonl
- Send one task instead of a full dump
- Multi-user capability
- Different encryption methods 
- Registration in UI
- New HTML editor
- Improving web performance

You can also implement these points in your pull request, it will help the project a lot. 

## 💼 Usage

### Creating a Task

1. Open the TODOList app.
2. Select requaired list.
3. Fill in the task details such as name, description, date, and priority.
4. Click add button.

### Editing a Task

1. Select requaired list.
2. Click on the task you want to edit.
3. Click on edit button.
4. Modify the task details as needed.
5. Click "Save" to update the task.

### Deleting a Task

1. Select requaired list.
2. Click on the task you want to delete.
3. Click the delete button.

### Sorting Tasks

1. Click "Alt" button or icon in navbar.
2. Click "Menu" > "Settings".
3. Log in to account.
4. Select the desired sort order (alphabet, priority, date, count).
5. Click "Save" to apply the sort order.
6. Restart the app.

### Using web-view
1. Add a new task or edit a task as usual.
2. In the “Description” field, insert only a link to the resource (not all sites are supported, for example, YouTube blocks playback of its videos from outside)
3. Add or save the task.

### Using custom HTML/CSS
1. Add a new task or edit a task as usual.
2. In the “Description” field, insert only HTML and CSS code (JavaScript is not supported at this time).
3. Add or save the task.

To avoid breaking the interface, it is recommended to use unique class names and id's in your CSS rather than referring to generic selectors.

## ❗️ License

This project is licensed under the MIT License. See the [LICENSE](/LICENSE) file for more information.