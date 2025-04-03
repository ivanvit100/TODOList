from flask import send_from_directory, make_response, jsonify, request # type: ignore
import os

def register_web_routes(app, logger, STATIC_DIR):
    @app.route('/')
    @app.route('/index.html')
    def serve_index():
        return send_from_directory(STATIC_DIR, 'index.html')

    @app.route('/src/css/<path:filename>')
    def serve_css(filename):
        response = make_response(send_from_directory(os.path.join(STATIC_DIR, 'src', 'css'), filename))
        response.headers['Content-Type'] = 'text/css'
        return response

    @app.route('/src/js/<path:filename>')
    def serve_js(filename):
        response = make_response(send_from_directory(os.path.join(STATIC_DIR, 'src', 'js'), filename))
        response.headers['Content-Type'] = 'application/javascript'
        return response

    @app.route('/src/icons/<path:filename>')
    def serve_icons(filename):
        return send_from_directory(os.path.join(STATIC_DIR, 'src', 'icons'), filename)

    @app.route('/<path:path>')
    def serve_any(path):
        file_path = os.path.join(STATIC_DIR, path)
        if os.path.isfile(file_path):
            directory, filename = os.path.split(file_path)
            return send_from_directory(directory, filename)
        
        return send_from_directory(STATIC_DIR, 'index.html')

    @app.errorhandler(404)
    def not_found_error(error):
        logger.warning(f"Страница не найдена: {request.url}")
        return jsonify({"status": "error", "message": "Страница не найдена"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Внутренняя ошибка сервера: {str(error)}")
        return jsonify({"status": "error", "message": "Внутренняя ошибка сервера"}), 500
        
    return app