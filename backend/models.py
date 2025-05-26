from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

# Initialize SQLAlchemy. This db object will be configured with the Flask app
# in app.py (e.g., db.init_app(app))
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    # email = db.Column(db.String(120), unique=True, nullable=False) # Example for future extension
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    portfolios = db.relationship('Portfolio', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.id}>'

class Portfolio(db.Model):
    __tablename__ = 'portfolios'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # Nullable if portfolios can be anonymous for now
    resume_filename = db.Column(db.String(255), nullable=True)
    
    # Store parsed data as JSON string
    _parsed_data = db.Column(db.Text, name='parsed_data', nullable=True)
    
    generated_html_content = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def parsed_data(self):
        """Access the _parsed_data string as a Python dict."""
        if self._parsed_data is None:
            return None
        return json.loads(self._parsed_data)

    @parsed_data.setter
    def parsed_data(self, value):
        """Store a Python dict as a JSON string in _parsed_data."""
        if value is None:
            self._parsed_data = None
        else:
            self._parsed_data = json.dumps(value)

    def __repr__(self):
        return f'<Portfolio {self.id} for User {self.user_id}>'

# Example of how to create tables (typically run once, e.g. in a Flask CLI command or init script)
# def init_db(app):
#     with app.app_context():
#         db.create_all()
