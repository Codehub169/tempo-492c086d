import os
import logging
from flask import Flask, request, jsonify, send_from_directory, current_app
from flask_cors import CORS
from werkzeug.utils import secure_filename
from config import Config

# Placeholder imports for future modules (not generated in this batch)
# from resume_parser import parse_resume 
# from portfolio_generator import generate_portfolio

# --- Helper Functions ---
def allowed_file(filename):
    """Checks if the uploaded file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

# --- Mock Portfolio Data (until parser and generator are implemented) ---
def get_mock_portfolio_data(filename):
    """Generates mock portfolio data based on the uploaded filename."""
    # Using hash of filename for a somewhat consistent random signature for Unsplash images
    img_sig = abs(hash(filename)) % 1000 
    return {
        "name": "Alex Doe (from Resume)",
        "title": "Proactive Professional & Quick Learner",
        "profilePicUrl": f"https://source.unsplash.com/random/200x200?portrait&sig={img_sig}",
        "summary": f"This interactive portfolio was dynamically generated from the resume: '{filename}'. It showcases key skills, experience, and educational background, ready for review.",
        "contact": {
            "email": "alex.doe@example.com",
            "phone": "+1-555-0199",
            "linkedin": "linkedin.com/in/alexdoe",
            "github": "github.com/alexdoe",
            "portfolio": "alexdoe-portfolio.example.com"
        },
        "experience": [
            { "id": 1, "title": "Lead Developer (Mock)", "company": "Innovatech Solutions", "duration": "Jan 2021 - Present", "description": "Led a team of 5 developers in creating scalable web solutions. Successfully launched 3 major products and improved system efficiency by 20%." },
            { "id": 2, "title": "Software Engineer (Mock)", "company": "Future Systems Ltd.", "duration": "Jun 2018 - Dec 2020", "description": "Developed and maintained key features for enterprise software. Contributed to a 15% reduction in bug reports through rigorous testing and code optimization." }
        ],
        "education": [
            { "id": 1, "degree": "M.S. in Advanced Computer Science", "institution": "Tech Excellence University", "year": "2018" },
            { "id": 2, "degree": "B.S. in Computer Engineering", "institution": "State Engineering College", "year": "2016" }
        ],
        "skills": ["Python", "Flask", "React", "JavaScript", "Cloud Computing", "Agile Methodologies", "Problem Solving", "Team Leadership (mock)"]
    }

# --- Flask App Initialization ---
# The static_folder points to the React build directory.
# The static_url_path means that files in static_folder are served from the root URL.
app = Flask(__name__, static_folder='../../frontend/build', static_url_path='/')
app.config.from_object(Config) # Load configuration from config.Config object

# Setup logging
if not app.debug:
    logging.basicConfig(level=logging.INFO)

CORS(app, resources={r"/api/*": {"origins": "*"}}) # Enable CORS for all API routes under /api/

# Ensure upload folder exists (create if it doesn't)
# This uses the UPLOAD_FOLDER path from the loaded Config
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- API Routes ---
@app.route('/api/upload', methods=['POST'])
def upload_resume_file():
    """Handles resume file uploads, processes it (mocked), and returns portfolio data."""
    if 'resume' not in request.files:
        app.logger.warning('No resume file part in request.')
        return jsonify({"error": "No resume file part in the request."}), 400
    
    file = request.files['resume']
    if file.filename == '':
        app.logger.warning('No file selected for upload.')
        return jsonify({"error": "No file selected."}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Consider adding a unique identifier to filename to prevent overwrites if necessary
        saved_filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        try:
            file.save(saved_filepath)
            app.logger.info(f'File {filename} saved to {saved_filepath}')
        except Exception as e:
            app.logger.error(f"Failed to save file '{filename}': {e}")
            return jsonify({"error": "Failed to save file on server."}), 500

        # --- TODO: Actual Resume Parsing and Portfolio Generation ---
        # try:
        #     parsed_data = parse_resume(saved_filepath) # Call to resume_parser.py
        #     portfolio_data = generate_portfolio(parsed_data) # Call to portfolio_generator.py
        # except Exception as e:
        #     app.logger.error(f"Error processing resume '{filename}': {e}")
        #     return jsonify({"error": "Failed to process resume data."}), 500
        # For now, returning mock portfolio data directly:
        portfolio_data = get_mock_portfolio_data(filename)
        
        return jsonify(portfolio_data), 200
    else:
        app.logger.warning(f'File type not allowed for {file.filename}.')
        allowed_types_str = ', '.join(current_app.config['ALLOWED_EXTENSIONS'])
        return jsonify({"error": f"File type not allowed. Allowed types: {allowed_types_str}"}), 400

# --- Serve React App ---
# This route serves the main index.html for the React app for any path not caught by API routes.
# It also handles serving other static assets from the build folder if they exist.
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    """Serves the React application's static files."""
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # For any other path, serve index.html to support client-side routing.
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Port 9000 as per project requirements.
    # Host '0.0.0.0' makes the server accessible externally (e.g., within Docker).
    # Debug mode is controlled by the FLASK_DEBUG environment variable or Config.DEBUG.
    app.run(host='0.0.0.0', port=9000)
