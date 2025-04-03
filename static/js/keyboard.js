// Описание: Файл для обработки клавиатурных событий
//
// Автор: ivanvit100 @ GitHub
//         https://ivanvit.ru
// Лицензия: MIT

let currentSection = 0; // 0: taskManager, 1: taskList, 2: taskViewer
let currentFocusedIndex = [-1, -1, -1];
let mouseIsMoving = false;
let mouseMovementTimer = null;

const getSections = () => {
    return [
        document.querySelector('.taskmanager'),
        document.querySelector('.tasklist'),
        document.querySelector('.task-viewer')
    ];
};

const getItemsInCurrentSection = () => {
    switch(currentSection) {
        case 0: 
            return Array.from(document.querySelectorAll('#manager li button'));
        case 1: 
            return Array.from(document.querySelectorAll('#list li button'));
        case 2: 
            return Array.from(document.querySelectorAll('.task-viewer .task-icon, .task-viewer .task-bottom button'));
        default: 
            return [];
    }
};

const setFocusToIndex = (index) => {
    const items = getItemsInCurrentSection();

    items.forEach(item => {
        item.classList.remove('keyboard-focus');
        item.parentElement && item.parentElement.classList.remove('keyboard-focus');
    });
    
    if (items.length === 0) {
        currentFocusedIndex[currentSection] = -1;
        return;
    }

    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;

    const targetItem = items[index];
    targetItem.classList.add('keyboard-focus');
    if (targetItem.parentElement && (currentSection === 0 || currentSection === 1))
        targetItem.parentElement.classList.add('keyboard-focus');

    targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    currentFocusedIndex[currentSection] = index;
};

const switchSection = (newSection) => {
    const sections = getSections();
    sections[currentSection].classList.remove('section-focus');

    currentSection = newSection;
    if (currentSection < 0) currentSection = 2;
    if (currentSection > 2) currentSection = 0;

    sections[currentSection].classList.add('section-focus');

    currentFocusedIndex[currentSection] >= 0 ?
        setFocusToIndex(currentFocusedIndex[currentSection]) : 
        setFocusToIndex(0);

    if (window.innerWidth < 1000) {
        UI.state = currentSection;
        UI.state_switch();
    }
};

const activateCurrentItem = () => {
    const index = currentFocusedIndex[currentSection];
    if (index < 0) return;

    const items = getItemsInCurrentSection();
    if (index >= items.length) return;

    items[index].click();
};

const clearAllFocus = () => {
    const sections = getSections();
    sections.forEach(section => {
        if (section) section.classList.remove('section-focus');
    });
    
    document.querySelectorAll('.keyboard-focus').forEach(el => {
        el.classList.remove('keyboard-focus');
    });
    
    currentFocusedIndex = [-1, -1, -1];
};

document.addEventListener('mousemove', function() {
    if (!mouseIsMoving) {
        mouseIsMoving = true;
        clearAllFocus();
    }
    
    clearTimeout(mouseMovementTimer);
    mouseMovementTimer = setTimeout(() => {
        mouseIsMoving = false;
    }, 100);
});

document.addEventListener('keydown', function(e) {
    mouseIsMoving = false;
    
    // Ctrl+N - Create new task (when task list is selected)
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('task-name').focus();
    }

    // Ctrl+L - Create new list
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        document.getElementById('tasklist-name').focus();
    }

    // Ctrl+E - Exit from account
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        window.logout();
    }
  
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            setFocusToIndex(currentFocusedIndex[currentSection] - 1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            setFocusToIndex(currentFocusedIndex[currentSection] + 1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            switchSection(currentSection - 1);
            break;
        case 'ArrowRight':
            e.preventDefault();
            switchSection(currentSection + 1);
            break;
        case 'Enter':
        case ' ': 
            e.preventDefault();
            activateCurrentItem();
            break;
        case 'Escape':
            const items = getItemsInCurrentSection();
            items.forEach(item => {
                item.classList.remove('keyboard-focus');
                item.parentElement && item.parentElement.classList.remove('keyboard-focus');
            });
            currentFocusedIndex[currentSection] = -1;
            getSections()[currentSection].classList.remove('section-focus');
            break;
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const modalTitle = document.getElementById('modal-title');

    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        modalTitle.textContent = 'Регистрация';
        document.getElementById('register-login').focus();
    });

    loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        modalTitle.textContent = 'Авторизация';
        document.getElementById('modal-login').focus();
    });
});

function logout() {
    window.dispatchEvent(new CustomEvent('user-logout'));
}