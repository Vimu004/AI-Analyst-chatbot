import os
from flask import Flask
from flask_cors import CORS 

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    
    CORS(app) 

    app.config.from_object('app.config.Config')

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    os.makedirs(app.config['UPLOADS_FOLDER'], exist_ok=True)
    os.makedirs(app.config['VISUALIZATIONS_FOLDER'], exist_ok=True)
    
    from . import routes
    app.register_blueprint(routes.main)
    
    return app
