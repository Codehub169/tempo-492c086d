import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
# Useful for development to set SECRET_KEY, FLASK_DEBUG, etc.
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '..', '.env')) # Load .env from project root

class Config:
    """Flask application configuration variables."""
    
    # Secret key for session management, CSRF protection, etc.
    # It's crucial to set this to a strong, random value in production.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev_secret_key_for_resume_portfolio_app_12345'
    
    # Debug mode: set to False in production
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() in ['true', '1', 't']
    
    # File Upload Configuration
    # UPLOAD_FOLDER: Directory where uploaded resumes will be stored.
    # os.path.dirname(__file__) is the 'backend' directory if config.py is in 'backend'.
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    
    # ALLOWED_EXTENSIONS: Set of allowed file extensions for resume uploads.
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
    
    # MAX_CONTENT_LENGTH: Maximum file size for uploads (e.g., 10MB).
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH') or 10 * 1024 * 1024) # 10 MB

    # Database Configuration (Placeholder for SQLite)
    # SQLALCHEMY_DATABASE_URI: Connection string for the database.
    # Defaults to a SQLite database named 'database.db' in the project root directory.
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'database.db')
    
    # SQLALCHEMY_TRACK_MODIFICATIONS: Disable Flask-SQLAlchemy event system if not needed.
    SQLALCHEMY_TRACK_MODIFICATIONS = False
