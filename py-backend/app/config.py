import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'a-default-secret-key')
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    UPLOADS_FOLDER = 'uploads'
    VISUALIZATIONS_FOLDER = 'visualizations'
    
    LANGCHAIN_TRACING_V2 = os.environ.get('LANGCHAIN_TRACING_V2', 'false').lower() == 'true'
    LANGCHAIN_API_KEY = os.environ.get('LANGCHAIN_API_KEY')
    LANGCHAIN_PROJECT = os.environ.get('LANGCHAIN_PROJECT', 'default-data-analysis-agent') # Optional: Name your project
    LANGCHAIN_ENDPOINT = os.environ.get('LANGCHAIN_ENDPOINT', 'https://api.smith.langchain.com')