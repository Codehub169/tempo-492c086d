#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "Starting Resume to Portfolio Generator setup..."

# Backend setup
echo "Setting up backend..."
if [ -d "backend" ]; then
  cd backend
  if [ -f "requirements.txt" ]; then
    echo "Installing Python dependencies..."
    # Ensure pip is available and requirements.txt is processed
    python3 -m pip install -r requirements.txt
  else
    echo "WARNING: backend/requirements.txt not found. Skipping Python dependency installation."
    echo "Please ensure backend dependencies are installed manually if needed."
  fi
  cd ..
else
  echo "WARNING: backend directory not found. Skipping backend setup."
fi

# Frontend setup
echo "Setting up frontend..."
if [ -d "frontend" ]; then
  cd frontend
  echo "Installing Node.js dependencies..."
  # Ensure npm is available
  if command -v npm &> /dev/null
  then
    npm install
    echo "Building frontend application..."
    npm run build
  else
    echo "ERROR: npm is not installed. Please install Node.js and npm."
    exit 1
  fi
  cd ..
else
  echo "ERROR: frontend directory not found. Cannot proceed with frontend setup."
  exit 1
fi

# Run the application
echo "Starting the Flask application..."
if [ -f "backend/app.py" ]; then
  echo "The application will be served by the backend on port 9000."
  echo "Access it at http://localhost:9000"
  # The backend/app.py MUST be configured to:
  # 1. Run on host 0.0.0.0 and port 9000.
  # 2. Serve static files from the '../frontend/build' directory (relative to app.py).
  python3 backend/app.py
else
  echo "ERROR: backend/app.py not found. Cannot start the application."
  exit 1
fi

echo "Application stopped."
