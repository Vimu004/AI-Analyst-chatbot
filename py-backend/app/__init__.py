import os
from flask import Flask
from flask_cors import CORS 

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    
    CORS(app) 

    app.config.from_object('app.config.Config')

    os.environ["LANGCHAIN_TRACING_V2"] = str(app.config['LANGCHAIN_TRACING_V2']).lower()
    if app.config.get('LANGCHAIN_API_KEY'):
        os.environ["LANGCHAIN_API_KEY"] = app.config['LANGCHAIN_API_KEY']
    if app.config.get('LANGCHAIN_PROJECT'):
        os.environ["LANGCHAIN_PROJECT"] = app.config['LANGCHAIN_PROJECT']
    if app.config.get('LANGCHAIN_ENDPOINT'):
        os.environ["LANGCHAIN_ENDPOINT"] = app.config['LANGCHAIN_ENDPOINT']

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    os.makedirs(app.config['UPLOADS_FOLDER'], exist_ok=True)
    os.makedirs(app.config['VISUALIZATIONS_FOLDER'], exist_ok=True)
    
    from . import routes
    app.register_blueprint(routes.main)
    
    return app