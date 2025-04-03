from flask import Flask # type: ignore
from flask_cors import CORS # type: ignore

from common import ( logger, PORT, STATIC_DIR, init_database )

init_database()

app = Flask(__name__)
CORS(app, supports_credentials=True)

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

from api import register_api_routes
from routes import register_web_routes

register_api_routes(app)
register_web_routes(app, logger, STATIC_DIR)

if __name__ == '__main__':
    try:
        logger.info(f"Сервер запущен на порту {PORT}")
        app.run(host='0.0.0.0', port=PORT, debug=True)
    except Exception as e:
        logger.critical(f"Критическая ошибка при запуске сервера: {str(e)}")