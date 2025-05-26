import React, { useState } from 'react'; // Removed unused useCallback
import { useNavigate } from 'react-router-dom';
import { uploadResume } from '../services/api';

// Simple SVG Upload Icon
const UploadIcon = () => (
  <svg className="upload-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
  </svg>
);

function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // Max 10MB
        setError('File size exceeds 10MB. Please upload a smaller file.');
        setSelectedFile(null);
        setFileName('');
        event.target.value = null; // Reset file input
        return;
      }
      // Align with backend: 'pdf', 'doc', 'docx'
      const allowedTypes = [
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
      ];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
        setSelectedFile(null);
        setFileName('');
        event.target.value = null; // Reset file input
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setError(null); // Clear previous errors
    }
 else {
      // If no file is selected (e.g., user cancels file dialog)
      setSelectedFile(null);
      setFileName('');
      setError(null); 
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a resume file to upload.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const portfolioData = await uploadResume(selectedFile);
      // response from uploadResume is already the data object (see api.js)
      navigate('/preview', { state: { resumeData: portfolioData } }); 
    } catch (err) {
      // err from uploadResume is an Error object with a message
      setError(err.message || 'Failed to upload and parse resume. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-page-container bg-light"> {/* bg-light from App.css will be overridden by JSX style background-image if it loads */}
      <div className="upload-card">
        <UploadIcon />
        <h1 className="font-primary">Create Your Portfolio</h1>
        <p className="font-secondary text-secondary">
          Upload your resume (PDF, DOC, DOCX - max 10MB) and we'll help you generate a stunning portfolio website in minutes.
        </p>
        <form onSubmit={handleSubmit} className="upload-form">
          <label htmlFor="resumeUpload" className="file-upload-label">
            {fileName ? `Change File: ${fileName}` : 'Choose Resume File'}
          </label>
          <input 
            type="file" 
            id="resumeUpload" 
            onChange={handleFileChange} 
            accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            aria-label="Resume file upload"
          />
          {/* fileName is now part of the label when a file is selected */}
          {/* {fileName && <p className="file-name">Selected: {fileName}</p>} */}
          
          <button type="submit" className="btn btn-primary" disabled={isLoading || !selectedFile}>
            {isLoading ? 'Processing...' : 'Generate Portfolio'}
          </button>
          
          {isLoading && <p className="loading-message" aria-live="polite">Parsing your resume, please wait...</p>}
          {error && <p className="error-message" role="alert">{error}</p>}
        </form>
      </div>
      {/* 
        NOTE: The <style jsx> tag below is specific to Next.js or projects with babel-plugin-styled-jsx.
        If this is a standard Create React App project, these styles will NOT apply without ejecting 
        and configuring Babel, or using a CSS-in-JS library. 
        For CRA, these styles should be moved to a .css file and imported.
        Assuming the project IS configured for <style jsx> for this review.
      */}
      <style jsx>{`
        .upload-page-container {
          /* This position:relative is crucial for the ::before pseudo-element to be positioned correctly */
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2020&q=80');
          background-size: cover;
          background-position: center;
          /* Ensure it fills viewport height if not already handled by App.css */
          /* min-height: 100vh; */ 
        }
        .upload-card {
            /* Ensures card is above the overlay */
            position: relative; 
            z-index: 1;
        }
        .upload-page-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(248, 249, 250, 0.85); /* Light overlay for text readability */
            /* z-index: 0 ensures overlay is behind .upload-card (z-index: 1) 
               but above the .upload-page-container's own background-image */
            z-index: 0;
        }
        /* Improved label to show filename */
        .file-upload-label {
           word-break: break-all; /* In case of very long filenames */
        }
      `}</style>
    </div>
  );
}

export default UploadPage;
