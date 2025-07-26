import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'a-default-secret-key')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    UPLOADS_FOLDER = 'uploads'
    VISUALIZATIONS_FOLDER = 'visualizations'