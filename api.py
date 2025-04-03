from collections import defaultdict
import time
from flask import request, jsonify # type: ignore
import jwt # type: ignore
import datetime
import json
import hashlib
from functools import wraps

from common import (
    logger, SECRET_KEY, JWT_COOKIE_NAME, JWT_EXPIRY_DAYS, DEFAULT_SETTINGS,
    USERS_FILE, get_user_data, get_task_list, save_task_list, add_task_list_to_user,
    remove_task_list_from_user, get_settings, save_settings
)

ip_error_tracker = defaultdict(list)
user_error_tracker = defaultdict(list)
blocked_ips = {}
blocked_users = {}

def ddos_protection(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        ip_address = request.remote_addr
        current_time = time.time()
        
        if ip_address in blocked_ips:
            block_until = blocked_ips[ip_address]
            if current_time < block_until:
                logger.warning(f"Запрос заблокирован: IP {ip_address} в черном списке еще {int((block_until - current_time) / 60)} минут")
                return jsonify({
                    'status': 'error',
                    'message': 'Слишком много ошибок. Пожалуйста, попробуйте позже.'
                }), 429
            else:
                del blocked_ips[ip_address]
                ip_error_tracker[ip_address] = []
        
        token = request.cookies.get(JWT_COOKIE_NAME)
        current_user = None
        if token:
            try:
                data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                current_user = data['login']
                
                if current_user in blocked_users:
                    block_until = blocked_users[current_user]
                    if current_time < block_until:
                        logger.warning(f"Запрос заблокирован: пользователь {current_user} в черном списке еще {int((block_until - current_time) / 60)} минут")
                        return jsonify({
                            'status': 'error',
                            'message': 'Слишком много ошибок. Пожалуйста, попробуйте позже.'
                        }), 429
                    else:
                        del blocked_users[current_user]
                        user_error_tracker[current_user] = []
            except:
                pass
        
        try:
            response = f(*args, **kwargs)
            
            if isinstance(response, tuple) and len(response) > 1 and response[1] >= 400:
                current_time = time.time()
                
                ip_error_tracker[ip_address].append(current_time)
                ip_error_tracker[ip_address] = [t for t in ip_error_tracker[ip_address] 
                                              if current_time - t < 300] 
                
                if current_user:
                    user_error_tracker[current_user].append(current_time)
                    user_error_tracker[current_user] = [t for t in user_error_tracker[current_user] 
                                                       if current_time - t < 300]
                
                if len(ip_error_tracker[ip_address]) >= 3:
                    block_until = current_time + 3600 
                    blocked_ips[ip_address] = block_until
                    logger.warning(f"IP {ip_address} заблокирован на 1 час из-за слишком большого количества ошибок")
                
                if current_user and len(user_error_tracker[current_user]) >= 3:
                    block_until = current_time + 3600
                    blocked_users[current_user] = block_until
                    logger.warning(f"Пользователь {current_user} заблокирован на 1 час из-за слишком большого количества ошибок")
            
            return response
            
        except Exception as e:
            current_time = time.time()
            
            ip_error_tracker[ip_address].append(current_time)
            ip_error_tracker[ip_address] = [t for t in ip_error_tracker[ip_address] 
                                          if current_time - t < 300]
            
            if current_user:
                user_error_tracker[current_user].append(current_time)
                user_error_tracker[current_user] = [t for t in user_error_tracker[current_user] 
                                                   if current_time - t < 300]
            
            if len(ip_error_tracker[ip_address]) >= 3:
                block_until = current_time + 3600
                blocked_ips[ip_address] = block_until
                logger.warning(f"IP {ip_address} заблокирован на 1 час из-за слишком большого количества ошибок")
            
            if current_user and len(user_error_tracker[current_user]) >= 3:
                block_until = current_time + 3600
                blocked_users[current_user] = block_until
                logger.warning(f"Пользователь {current_user} заблокирован на 1 час из-за слишком большого количества ошибок")
            
            raise
            
    return decorated

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        token = request.cookies.get(JWT_COOKIE_NAME)
        
        if not token:
            logger.warning("Попытка доступа без токена")
            return jsonify({
                'status': 'error',
                'message': 'Требуется авторизация'
            }), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data['login']
            logger.info(f"Авторизованный доступ: {current_user}")
        except jwt.ExpiredSignatureError:
            logger.warning("Попытка доступа с просроченным токеном")
            return jsonify({
                'status': 'error',
                'message': 'Токен просрочен'
            }), 401
        except jwt.InvalidTokenError:
            logger.warning("Попытка доступа с недействительным токеном")
            return jsonify({
                'status': 'error',
                'message': 'Недействительный токен'
            }), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def register_api_routes(app):
    @app.route('/api/v1/validateToken', methods=['POST'])
    @ddos_protection
    def validate_token():
        try:
            token = request.cookies.get(JWT_COOKIE_NAME)

            if not token:
                return jsonify({
                    "status": "error",
                    "message": "Войдите в аккаунт"
                }), 401

            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                username = payload.get('login')  

                # Открываем файл пользователей напрямую, чтобы проверить существование пользователя
                with open(USERS_FILE, 'r', encoding='utf-8') as f:
                    users = json.load(f)

                if username not in users:
                    logger.warning(f"Попытка аутентификации удаленного пользователя: {username}")
                    response = jsonify({
                        "status": "error",
                        "message": "Учетная запись была удалена"
                    })
                    response.delete_cookie(JWT_COOKIE_NAME)
                    return response, 401

                return jsonify({
                    "status": "success",
                    "message": "Добро пожаловать"
                })

            except jwt.ExpiredSignatureError:
                logger.warning("Попытка валидации с просроченным токеном")
                return jsonify({
                    "status": "error",
                    "message": "Токен просрочен"
                }), 401

            except jwt.InvalidTokenError:
                logger.warning("Попытка валидации с недействительным токеном")
                return jsonify({
                    "status": "error",
                    "message": "Недействительный токен"
                }), 401

        except Exception as e:
            logger.error(f"Ошибка при валидации токена: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Внутренняя ошибка сервера"
            }), 500
    
    @app.route('/api/v1/auth', methods=['POST'])
    @ddos_protection
    def auth():
        try:
            data = request.json
            login = data.get('login')
            password = data.get('password')
            
            user = get_user_data(login, password)
            if user:
                token = jwt.encode({
                    'login': login,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(days=JWT_EXPIRY_DAYS)
                }, SECRET_KEY, algorithm="HS256")
                
                response = jsonify({
                    "status": "success",
                    "message": "Успешная авторизация"
                })
                
                expires = datetime.datetime.utcnow() + datetime.timedelta(days=JWT_EXPIRY_DAYS)
                response.set_cookie(
                    JWT_COOKIE_NAME, 
                    token, 
                    httponly=True, 
                    secure=request.is_secure,
                    samesite='Strict',
                    expires=expires
                )
                
                logger.info(f"Успешная авторизация пользователя {login}")
                return response
            else:
                logger.warning(f"Неудачная попытка авторизации с логином {login}")
                return jsonify({
                    "status": "error",
                    "message": "Неверный логин или пароль"
                })
        except Exception as e:
            logger.error(f"Ошибка при авторизации: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Произошла ошибка при авторизации"
            }), 500

    @app.route('/api/v1/register', methods=['POST'])
    @ddos_protection
    def register():
        try:
            data = request.json
            login = data.get('login')
            password = data.get('password')
            
            if not login or not password:
                return jsonify({
                    "status": "error",
                    "message": "Необходимо указать логин и пароль"
                })
            
            if len(login) < 3:
                return jsonify({
                    "status": "error",
                    "message": "Логин должен содержать минимум 3 символа"
                })
                
            if len(password) < 6:
                return jsonify({
                    "status": "error",
                    "message": "Пароль должен содержать минимум 6 символов"
                })
            
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                users = json.load(f)
            
            if login in users:
                logger.warning(f"Попытка регистрации с существующим логином: {login}")
                return jsonify({
                    "status": "error",
                    "message": "Пользователь с таким логином уже существует"
                })
            
            default_list_name = "default"
            default_icon = "head"
            
            users[login] = {
                "password": hashlib.sha256(password.encode()).hexdigest(),
                "tasklists": [{"name": default_list_name, "icon": default_icon}],
                "settings": DEFAULT_SETTINGS
            }
            
            with open(USERS_FILE, 'w', encoding='utf-8') as f:
                json.dump(users, f, indent=2, ensure_ascii=False)
            
            default_tasklist = {
                "data": [
                    {
                        "name": "Добро пожаловать в TODOList!",
                        "description": """
                            <div style='font-family: Arial, sans-serif; max-height: 100%; overflow-y: auto; padding: 0 15px;'>
                                <h3 style='color: #4285f4; margin-top: 0; margin-bottom: 10px;'>Добро пожаловать в TODOList!</h3>

                                <p style='margin-top: 8px;'>Это современное приложение для управления задачами, которое поможет вам быть продуктивнее каждый день.</p>

                                <h4 style='color: #0f9d58; margin-top: 12px; margin-bottom: 8px;'>Основные возможности:</h4>
                                <ul style='margin-top: 5px; padding-left: 25px;'>
                                  <li><b>Организация</b> - создавайте разные списки задач для работы, дома и хобби</li>
                                  <li><b>Приоритеты</b> - назначайте приоритеты задачам от 1 до 10</li>
                                  <li><b>Сроки</b> - устанавливайте даты выполнения для важных задач</li>
                                  <li><b>Фильтрация</b> - фильтруйте задачи по статусу, дате и приоритету</li>
                                  <li><b>Темная тема</b> - работайте комфортно в любое время суток</li>
                                  <li><b>Кроссплатформенность</b> - доступ к задачам с любого устройства</li>
                                </ul>

                                <h4 style='color: #ea4335; margin-top: 12px; margin-bottom: 8px;'>Как начать:</h4>
                                <ol style='margin-top: 5px; padding-left: 25px;'>
                                  <li>Создайте новый список задач с помощью формы слева</li>
                                  <li>Добавьте свою первую задачу, используя форму выше</li>
                                  <li>Отмечайте выполненные задачи и наблюдайте за своим прогрессом</li>
                                </ol>

                                <p style='font-style: italic; color: var(--neutral-500); margin-top: 10px;'>TODOList помогает превратить сложные проекты в простые, управляемые задачи.</p>

                                <p style='margin-top: 10px; font-size: 0.9em;'>
                                  Автор: <a href='https://ivanvit.ru' style='color: #4285f4; text-decoration: none;'>ivanvit.ru</a> | 
                                  <a href='https://github.com/ivanvit100' style='color: #4285f4; text-decoration: none;'>ivanvit100 @ GitHub</a>
                                </p>
                            </div>""",
                        "done": False,
                        "date": None,
                        "lvl": 1
                    }
                ],
                "icon": default_icon
            }
            
            save_task_list(default_list_name, default_tasklist, login)
            
            token = jwt.encode({
                'login': login,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=JWT_EXPIRY_DAYS)
            }, SECRET_KEY, algorithm="HS256")
            
            response = jsonify({
                "status": "success",
                "message": "Регистрация успешно завершена"
            })
            
            expires = datetime.datetime.utcnow() + datetime.timedelta(days=JWT_EXPIRY_DAYS)
            response.set_cookie(
                JWT_COOKIE_NAME, 
                token, 
                httponly=True, 
                secure=request.is_secure,
                samesite='Strict',
                expires=expires
            )
            
            logger.info(f"Зарегистрирован новый пользователь: {login}")
            return response
        
        except Exception as e:
            logger.error(f"Ошибка при регистрации: {str(e)}")
            return jsonify({
                "status": "error",
                "message": f"Произошла ошибка при регистрации: {str(e)}"
            }), 500

    @app.route('/api/v1/logout', methods=['POST'])
    def logout():
        try:
            response = jsonify({
                "status": "success",
                "message": "Выход выполнен успешно"
            })
            
            response.delete_cookie(JWT_COOKIE_NAME)
            
            logger.info("Пользователь вышел из системы")
            return response
        except Exception as e:
            logger.error(f"Ошибка при выходе из системы: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Произошла ошибка при выходе из системы"
            }), 500

    @app.route('/api/v1/getTaskListList', methods=['POST'])
    @ddos_protection
    @token_required
    def get_task_list_list(current_user):
        try:
            user = get_user_data(current_user)
            if user:
                tasklists = user["tasklists"]
                
                if tasklists and isinstance(tasklists[0], str):
                    with open(USERS_FILE, 'r', encoding='utf-8') as f:
                        users = json.load(f)
                    
                    users[current_user]["tasklists"] = [{"name": name, "icon": "default"} for name in tasklists]
                    
                    with open(USERS_FILE, 'w', encoding='utf-8') as f:
                        json.dump(users, f, indent=2, ensure_ascii=False)
                    
                    tasklists = users[current_user]["tasklists"]
                
                return jsonify({
                    "status": "success",
                    "message": tasklists
                })
            else:
                logger.warning(f"Пользователь не найден: {current_user}")
                return jsonify({
                    "status": "error",
                    "message": "Пользователь не найден"
                })
        except Exception as e:
            logger.error(f"Ошибка при получении списка задач для пользователя {current_user}: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Произошла ошибка при получении списка задач"
            }), 500

    @app.route('/api/v1/getTaskList', methods=['POST'])
    @ddos_protection
    @token_required
    def get_task_list_api(current_user):
        try:
            data = request.json
            tasklist_name = data.get('taskList')
            
            if not tasklist_name:
                return jsonify({
                    "status": "error",
                    "message": "Имя списка задач не указано"
                })
            
            task_list = get_task_list(tasklist_name, current_user)
            
            if "icon" not in task_list:
                user = get_user_data(current_user)
                if user:
                    tasklists = user["tasklists"]
                    
                    if tasklists and isinstance(tasklists[0], dict):
                        for tasklist in tasklists:
                            if tasklist["name"] == tasklist_name:
                                task_list["icon"] = tasklist.get("icon", "default")
                                break
                    
                    if "icon" not in task_list:
                        task_list["icon"] = "head"
                    
                    save_task_list(tasklist_name, task_list, current_user)
            
            return jsonify({
                "status": "success",
                "message": task_list
            })
        except Exception as e:
            logger.error(f"Ошибка при получении списка задач для пользователя {current_user}: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Произошла ошибка при получении списка задач"
            }), 500

    @app.route('/api/v1/saveTaskList', methods=['POST'])
    @ddos_protection
    @token_required
    def save_task_list_api(current_user):
        try:
            data = request.json
            tasklist_name = data.get('taskList')
            tasklist_data = data.get('data')
            icon = data.get('icon', 'head')

            if not tasklist_name or not tasklist_data:
                return jsonify({
                    "status": "error",
                    "message": "Недостаточно данных для сохранения списка задач"
                }), 400

            if '/' in tasklist_name or '.' in tasklist_name:
                logger.warning(f"API: Попытка создания списка задач с недопустимыми символами: {tasklist_name}")
                return jsonify({
                    "status": "error",
                    "message": "Имя списка не должно содержать символы '/' или '.'"
                }), 400

            if isinstance(tasklist_data, dict) and "data" in tasklist_data and isinstance(tasklist_data["data"], list):
                task_names = []
                for task in tasklist_data["data"]:
                    if isinstance(task, dict) and 'name' in task:
                        task_names.append(task['name'])
                    elif hasattr(task, 'name') and task.name:
                        task_names.append(task.name)

                if len(task_names) != len(set(task_names)):
                    logger.warning(f"API: В списке задач есть дубликаты имен. Сохранение отменено.")
                    return jsonify({
                        "status": "error",
                        "message": "В списке есть задачи с одинаковыми именами"
                    }), 400

            if isinstance(tasklist_data, dict) and "icon" not in tasklist_data:
                tasklist_data["icon"] = icon

            try:
                result = save_task_list(tasklist_name, tasklist_data, current_user)

                if not result:
                    return jsonify({
                        "status": "error",
                        "message": "Не удалось сохранить список задач"
                    }), 400

                return jsonify({
                    "status": "success",
                    "message": "Список задач успешно сохранен"
                })
            except ValueError as ve:
                logger.warning(f"Ошибка валидации при сохранении списка задач: {str(ve)}")
                return jsonify({
                    "status": "error",
                    "message": str(ve)
                }), 400

        except Exception as e:
            logger.error(f"Ошибка при сохранении списка задач для пользователя {current_user}: {str(e)}")
            return jsonify({
                "status": "error",
                "message": f"Произошла ошибка при сохранении списка задач: {str(e)}"
            }), 500

    @app.route('/api/v1/deleteList', methods=['POST'])
    @ddos_protection
    @token_required
    def delete_list(current_user):
        try:
            data = request.json
            tasklist_name = data.get('taskList')
            
            if not tasklist_name:
                return jsonify({
                    "status": "error",
                    "message": "Имя списка задач не указано"
                })
            
            remove_task_list_from_user(current_user, tasklist_name)
            
            return jsonify({
                "status": "success",
                "message": "Список удалён"
            })
        except Exception as e:
            logger.error(f"Ошибка при удалении списка задач для пользователя {current_user}: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Произошла ошибка при удалении списка задач"
            }), 500

    @app.route('/api/v1/getSettings', methods=['POST'])
    @ddos_protection
    @token_required
    def get_settings_api(current_user):
        try:
            settings = get_settings(current_user)
            return jsonify({
                "status": "success",
                "message": settings
            })
        except Exception as e:
            logger.error(f"Ошибка при получении настроек для пользователя {current_user}: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Произошла ошибка при получении настроек"
            }), 500

    @app.route('/api/v1/setSettings', methods=['POST'])
    @ddos_protection
    @token_required
    def set_settings_api(current_user):
        try:
            data = request.json
            settings = get_settings(current_user)
            
            for key, value in data.items():
                settings[key] = value
            
            save_settings(settings, current_user)
            logger.info(f"Сохранены настройки для пользователя {current_user}")
            
            return jsonify({
                "status": "success",
                "message": "Настройки успешно сохранены"
            })
        except Exception as e:
            logger.error(f"Ошибка при сохранении настроек для пользователя {current_user}: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Произошла ошибка при сохранении настроек"
            }), 500

    @app.route('/api/v1/getConfig', methods=['GET'])
    @ddos_protection
    def get_config():
        try:
            return jsonify({
                "theme": DEFAULT_SETTINGS.get("theme", "dark"),
                "color-date-alert": DEFAULT_SETTINGS.get("color-date-alert", True),
                "sort-order": DEFAULT_SETTINGS.get("sort-order", "alphabet")
            })
        except Exception as e:
            logger.error(f"Ошибка при получении конфигурации: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Произошла ошибка при получении конфигурации"
            }), 500