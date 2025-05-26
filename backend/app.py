import os
import logging
from flask import Flask, request, jsonify, send_from_directory, current_app
from flask_cors import CORS
from werkzeug.utils import secure_filename
from config import Config
from resume_parser import parse_resume
# from portfolio_generator import generate_portfolio # This function is not defined in portfolio_generator.py, generate_portfolio_html is

# --- Helper Functions ---
def allowed_file(filename):
    """Checks if the uploaded file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def _transform_parsed_data_to_frontend_format(parsed_data):
    """Transforms data from parse_resume into the format expected by PreviewPage.js."""
    # profilePicUrl is handled directly in PreviewPage.js with a random image for now.
    # The keys like 'fullName' and 'jobTitle' match what PreviewPage.js expects.
    frontend_data = {
        "fullName": parsed_data.get('name', 'Name not parsed'),
        "jobTitle": parsed_data.get('title', 'Title not parsed'),
        "summary": parsed_data.get('summary', 'Summary not parsed.'),
        "contact": {
            "email": parsed_data.get('email', ''),
            "phone": parsed_data.get('phone', ''),
            "linkedin": parsed_data.get('linkedin', ''),
            "github": parsed_data.get('github', '')
        },
        # Experience and Education are passed as lists of strings/text blocks
        # as parsed by the current resume_parser.py.
        "experience": parsed_data.get('experience', []),
        "education": parsed_data.get('education', []),
        "skills": parsed_data.get('skills', [])
    }
    return frontend_data

# --- Flask App Initialization ---
app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')
app.config.from_object(Config)

# Configure logging
if not app.debug:
    # Use a more standard logging configuration for production
    # Flask's app.logger will use this configuration
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
elif app.debug:
    # For debug mode, ensure logger level is DEBUG if needed, though Flask default is usually fine.
    # app.logger.setLevel(logging.DEBUG) # Uncomment if more verbose debug logs are needed
    pass # Default Flask debug logging is often sufficient

# Enable CORS for API routes
CORS(app, resources={r"/api/*": {"origins": "*"}}) # For production, restrict origins

# Ensure upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.logger.info(f"Created upload folder: {app.config['UPLOAD_FOLDER']}")

# --- API Routes ---
@app.route('/api/upload', methods=['POST'])
def upload_resume_file():
    if 'resume' not in request.files:
        app.logger.warning('No resume file part in request.')
        return jsonify({"error": "No resume file part in the request."}), 400
    
    file = request.files['resume']
    if file.filename == '':
        app.logger.warning('No file selected for upload.')
        return jsonify({"error": "No file selected."}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Consider adding a unique prefix to filename to prevent overwrites if storing permanently
        # import uuid
        # unique_filename = str(uuid.uuid4()) + "_" + filename
        # saved_filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        saved_filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        try:
            file.save(saved_filepath)
            app.logger.info(f'File {filename} saved to {saved_filepath}')
        except Exception as e:
            app.logger.error(f"Failed to save file '{filename}': {e}", exc_info=True)
            return jsonify({"error": "Failed to save file on server."}), 500

        try:
            parsed_data = parse_resume(saved_filepath)
            # The filename argument was removed from _transform_parsed_data_to_frontend_format as it was unused.
            portfolio_data = _transform_parsed_data_to_frontend_format(parsed_data)
        except ValueError as ve: # Catch specific errors from parser if possible
            app.logger.error(f"Unsupported file type or parsing error for '{filename}': {ve}", exc_info=True)
            return jsonify({"error": str(ve)}), 400 # Or 422 Unprocessable Entity
        except Exception as e:
            app.logger.error(f"Error processing resume '{filename}': {e}", exc_info=True)
            error_message = str(e) if app.debug else "Failed to process resume data."
            return jsonify({"error": error_message}), 500
        
        return jsonify(portfolio_data), 200
    else:
        app.logger.warning(f'File type not allowed for {file.filename}.')
        allowed_types_str = ', '.join(sorted(list(current_app.config['ALLOWED_EXTENSIONS'])))
        return jsonify({"error": f"File type not allowed. Allowed types: {allowed_types_str}"}), 400

# --- Serve React App ---
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        index_path = os.path.join(app.static_folder, 'index.html')
        if not os.path.exists(index_path):
            app.logger.error(f"index.html not found in static folder: {app.static_folder}")
            # This usually means the frontend hasn't been built or static_folder is misconfigured.
            return jsonify({"error": "Application not built or index.html missing. Please build the frontend."}), 404
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    # Debug mode is typically controlled by FLASK_DEBUG env var or app.config['DEBUG']
    app.run(host='0.0.0.0', port=9000, debug=app.config.get('DEBUG', False))
