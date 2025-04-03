import os
import json
import hashlib
import logging
import glob
from dotenv import load_dotenv # type: ignore

load_dotenv()

PORT = int(os.getenv('PORT', 3000))
SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key_change_in_production')
SALT = os.getenv('SALT', 'default_salt_change_in_production')
JWT_COOKIE_NAME = os.getenv('JWT_COOKIE_NAME', 'todo_jwt')
JWT_EXPIRY_DAYS = int(os.getenv('JWT_EXPIRY_DAYS', 7))

class LimitedLogHandler(logging.FileHandler):
    def __init__(self, filename, max_lines=150, encoding=None):
        if os.path.exists(filename):
            with open(filename, 'r', encoding=encoding) as f:
                lines = f.readlines()
                if len(lines) >= max_lines:
                    lines = lines[-max_lines+1:]
            with open(filename, 'w', encoding=encoding) as f:
                f.writelines(lines)
        super().__init__(filename, mode='a', encoding=encoding)
        self.max_lines = max_lines
        self.line_count = sum(1 for _ in open(filename, 'r')) if os.path.exists(filename) else 0
        
    def emit(self, record):
        if self.line_count >= self.max_lines:
            self.close()
            with open(self.baseFilename, 'r', encoding=self.encoding) as f:
                lines = f.readlines()[-(self.max_lines-1):]
            with open(self.baseFilename, 'w', encoding=self.encoding) as f:
                f.writelines(lines)
            self._open()
            self.line_count = len(lines)
        self.line_count += 1
        super().emit(record)

log_file = 'app.log'
file_handler = LimitedLogHandler(log_file, max_lines=150, encoding='utf-8')
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.WARNING)

logging.basicConfig(level=logging.WARNING, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                   handlers=[file_handler, logging.StreamHandler()])

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static')
DATA_DIR = os.path.join(BASE_DIR, 'data')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')

os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_SETTINGS = {
    "theme": "dark",
    "color-date-alert": True,
    "sort-order": "priority"
}

def get_user_data(login, password=None):
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            users = json.load(f)
        
        if login not in users:
            return None
        
        if password and users[login]["password"] != hashlib.sha256(password.encode()).hexdigest():
            return None
        
        return users[login]
    except Exception as e:
        logger.error(f"Ошибка при получении данных пользователя {login}: {str(e)}")
        return None

def generate_tasklist_filename(list_name, login):
    login_hash = hashlib.sha256(login.encode()).hexdigest()
    login_salt_hash = hashlib.sha256(f"{login}{SALT}".encode()).hexdigest()
    return f"{list_name}-{login_hash}-{login_salt_hash}.json"

def find_tasklist_files(login):
    login_hash = hashlib.sha256(login.encode()).hexdigest()
    login_salt_hash = hashlib.sha256(f"{login}{SALT}".encode()).hexdigest()
    pattern = os.path.join(DATA_DIR, f"*-{login_hash}-{login_salt_hash}.json")
    return glob.glob(pattern)

def extract_tasklist_name(filename, login):
    login_hash = hashlib.sha256(login.encode()).hexdigest()
    login_salt_hash = hashlib.sha256(f"{login}{SALT}".encode()).hexdigest()
    basename = os.path.basename(filename)
    list_name = basename.replace(f"-{login_hash}-{login_salt_hash}.json", "")
    return list_name

def get_task_list(list_name, login):
    try:
        filename = generate_tasklist_filename(list_name, login)
        file_path = os.path.join(DATA_DIR, filename)
        
        if not os.path.exists(file_path):
            return {"data": []}
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Ошибка при получении списка задач {list_name} для пользователя {login}: {str(e)}")
        return {"data": []}

def save_task_list(tasklist_name, tasklist_data, username):
    try:
        if '/' in tasklist_name or '.' in tasklist_name:
            logger.warning(f"Попытка создания списка задач с недопустимыми символами: {tasklist_name}")
            raise ValueError("Имя списка не должно содержать символы '/' или '.'")
        
        if len(tasklist_name) > 20:
            logger.warning(f"Имя списка задач слишком длинное: {tasklist_name}")
            raise ValueError("Имя списка не должно превышать 20 символов")
        
        if isinstance(tasklist_data, dict) and "icon" not in tasklist_data:
            tasklist_data["icon"] = "head"
        
        icons_dir = os.path.join(STATIC_DIR, 'icons', 'lists')
        valid_icons = [os.path.splitext(f)[0] for f in os.listdir(icons_dir) 
                      if os.path.isfile(os.path.join(icons_dir, f))]
        
        if isinstance(tasklist_data, dict) and tasklist_data["icon"] not in valid_icons:
            logger.warning(f"Невалидная иконка: {tasklist_data.get('icon')}, использую значение по умолчанию")
            tasklist_data["icon"] = "head"
            
        if isinstance(tasklist_data, dict) and "data" in tasklist_data:
            if not isinstance(tasklist_data["data"], list):
                tasklist_data["data"] = []
            
            if len(tasklist_data["data"]) > 50:
                logger.warning(f"Слишком много задач в списке (максимум 50): {len(tasklist_data['data'])}")
                raise ValueError("Превышено максимальное количество задач (50)")
            
            # Очистка имен задач - поддержка как dict, так и объектов
            for task in tasklist_data["data"]:
                # Обработка для словарей (из JSON)
                if isinstance(task, dict) and 'name' in task and task['name']:
                    clean_name = task['name'].strip()
                    while '  ' in clean_name:
                        clean_name = clean_name.replace('  ', ' ')
                    task['name'] = clean_name
                # Обработка для объектов с атрибутами
                elif hasattr(task, 'name') and task.name:
                    clean_name = task.name.strip()
                    while '  ' in clean_name:
                        clean_name = clean_name.replace('  ', ' ')
                    task.name = clean_name
            
            # Проверка на дубликаты имен
            task_names = []
            for task in tasklist_data["data"]:
                if isinstance(task, dict) and 'name' in task:
                    task_names.append(task['name'])
                elif hasattr(task, 'name') and task.name:
                    task_names.append(task.name)
            
            if len(task_names) != len(set(task_names)):
                logger.warning(f"В списке задач есть дубликаты имен. Сохранение отменено.")
                raise ValueError("В списке есть задачи с одинаковыми именами")
            
            # Проверка валидации и создание сериализуемых задач
            serializable_tasks = []
            for task in tasklist_data["data"]:
                # Проверки для словарей
                if isinstance(task, dict):
                    if 'name' in task and task['name'] and len(task['name']) > 20:
                        logger.warning(f"Имя задачи слишком длинное: {task['name']}")
                        raise ValueError(f"Имя задачи не должно превышать 20 символов: '{task['name'][:17]}...'")
                    
                    if 'description' in task and task['description'] and len(task['description']) > 256:
                        logger.warning(f"Описание задачи слишком длинное: {task['description'][:30]}...")
                        raise ValueError(f"Описание задачи не должно превышать 256 символов")
                    
                    if 'lvl' in task:
                        try:
                            lvl_val = int(task['lvl'])
                            if lvl_val < 0 or lvl_val > 999:
                                logger.warning(f"Недопустимый приоритет задачи: {lvl_val}")
                                raise ValueError(f"Приоритет задачи должен быть положительным числом, не превышающим 999")
                            task['lvl'] = lvl_val
                        except (ValueError, TypeError):
                            logger.warning(f"Некорректный формат приоритета задачи: {task['lvl']}")
                            raise ValueError(f"Приоритет задачи должен быть целым положительным числом")
                    
                    if 'date' in task and task['date'] and not isinstance(task['date'], str):
                        try:
                            task['date'] = task['date'].isoformat()
                        except AttributeError:
                            task['date'] = None
                
                # Проверки для объектов с атрибутами
                else:
                    if hasattr(task, 'name') and task.name and len(task.name) > 20:
                        logger.warning(f"Имя задачи слишком длинное: {task.name}")
                        raise ValueError(f"Имя задачи не должно превышать 20 символов: '{task.name[:17]}...'")
                    
                    if hasattr(task, 'description') and task.description and len(task.description) > 256:
                        logger.warning(f"Описание задачи слишком длинное: {task.description[:30]}...")
                        raise ValueError(f"Описание задачи не должно превышать 256 символов")
                    
                    if hasattr(task, 'lvl'):
                        try:
                            lvl_val = int(task.lvl)
                            if lvl_val < 0 or lvl_val > 999:
                                logger.warning(f"Недопустимый приоритет задачи: {lvl_val}")
                                raise ValueError(f"Приоритет задачи должен быть положительным числом, не превышающим 999")
                            task.lvl = lvl_val
                        except (ValueError, TypeError):
                            logger.warning(f"Некорректный формат приоритета задачи: {task.lvl}")
                            raise ValueError(f"Приоритет задачи должен быть целым положительным числом")
                    
                    if hasattr(task, 'date') and task.date and not isinstance(task.date, str):
                        try:
                            task.date = task.date.isoformat()
                        except AttributeError:
                            task.date = None
                
                serializable_tasks.append(task)
            
            tasklist_data["data"] = serializable_tasks
        
        filename = generate_tasklist_filename(tasklist_name, username)
        file_path = os.path.join(DATA_DIR, filename)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(tasklist_data, f, indent=2, ensure_ascii=False)
        
        add_task_list_to_user(username, tasklist_name, tasklist_data.get("icon", "head"))
        
        return True
    except ValueError as ve:
        logger.warning(f"Ошибка валидации при сохранении списка задач: {str(ve)}")
        raise ve
    except Exception as e:
        logger.error(f"Ошибка при сохранении списка задач: {str(e)}")
        return False

def get_settings(login=None):
    try:
        if login is None:
            return DEFAULT_SETTINGS
        
        user_data = get_user_data(login)
        if user_data and "settings" in user_data:
            return user_data["settings"]
        else:
            return DEFAULT_SETTINGS
    except Exception as e:
        logger.error(f"Ошибка при получении настроек для пользователя {login}: {str(e)}")
        return DEFAULT_SETTINGS

def save_settings(settings, login):
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            users = json.load(f)
        
        if login in users:
            users[login]["settings"] = settings
            
            with open(USERS_FILE, 'w', encoding='utf-8') as f:
                json.dump(users, f, indent=2, ensure_ascii=False)
            logger.info(f"Сохранены настройки для пользователя {login}")
        else:
            logger.warning(f"Пользователь {login} не найден, настройки не сохранены")
    except Exception as e:
        logger.error(f"Ошибка при сохранении настроек для пользователя {login}: {str(e)}")
        raise

def add_task_list_to_user(username, tasklist_name, icon="head"):
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            users = json.load(f)
        
        if username not in users:
            return False
        
        tasklists = users[username]["tasklists"]
        
        if tasklists and isinstance(tasklists[0], str):
            tasklists = [{"name": name, "icon": "head"} for name in tasklists]
        
        tasklist_exists = False
        for tasklist in tasklists:
            if tasklist["name"] == tasklist_name:
                tasklist_exists = True
                tasklist["icon"] = icon 
                break
        
        if not tasklist_exists:
            tasklists.append({"name": tasklist_name, "icon": icon})
        
        users[username]["tasklists"] = tasklists
        
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        logger.error(f"Ошибка при добавлении списка задач пользователю: {str(e)}")
        return False

def remove_task_list_from_user(current_user, tasklist_name):
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        users = json.load(f)
    
    if current_user in users:
        users[current_user]["tasklists"] = [
            tasklist for tasklist in users[current_user]["tasklists"] 
            if (isinstance(tasklist, str) and tasklist != tasklist_name) or 
               (isinstance(tasklist, dict) and tasklist["name"] != tasklist_name)
        ]
        
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
    
    task_file_path = f"./data/{current_user}_{tasklist_name}.json"
    if os.path.exists(task_file_path):
        os.remove(task_file_path)
        logger.info(f"Удален файл списка задач: {task_file_path}")

def init_database():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            admin_login_hash = hashlib.sha256("admin".encode()).hexdigest()
            admin_login_salt_hash = hashlib.sha256(f"admin{SALT}".encode()).hexdigest()
            
            json.dump({
                "admin": {
                    "password": hashlib.sha256("admin".encode()).hexdigest(),
                    "tasklists": ["Задачи администратора"],
                    "settings": DEFAULT_SETTINGS
                }
            }, f, indent=2, ensure_ascii=False)
            
            default_tasklist_file = os.path.join(DATA_DIR, f'Задачи администратора-{admin_login_hash}-{admin_login_salt_hash}.json')
            with open(default_tasklist_file, 'w', encoding='utf-8') as task_file:
                json.dump({
                    "data": [
                        {
                            "name": "Пример задачи",
                            "description": "Это пример задачи. Вы можете создать свою задачу, используя форму выше.",
                            "done": False,
                            "date": None,
                            "lvl": 1
                        }
                    ]
                }, task_file, indent=2, ensure_ascii=False)