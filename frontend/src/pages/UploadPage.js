import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import { uploadResume } from '../services/api'; // To be implemented

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
        return;
      }
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
        setSelectedFile(null);
        setFileName('');
        return;
      }
      setSelectedFile(file);
      setFileName(file.name);
      setError(null); // Clear previous errors
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

    // Simulate API call
    // In a real app, you would use the imported api service:
    // try {
    //   const response = await uploadResume(selectedFile);
    //   // Assuming response contains data or an ID for the preview
    //   navigate('/preview', { state: { resumeData: response.data } }); 
    // } catch (err) {
    //   setError('Failed to upload and parse resume. Please try again.');
    //   console.error('Upload error:', err);
    // } finally {
    //   setIsLoading(false);
    // }

    // Simulate delay and navigation for now
    setTimeout(() => {
      setIsLoading(false);
      // Pass mock data or an identifier to preview page if needed
      // For now, just navigate. Data fetching will be in PreviewPage or passed via state.
      console.log('Simulating successful upload of:', selectedFile.name);
      navigate('/preview', { state: { uploadedFileName: selectedFile.name } });
    }, 2000);
  };

  return (
    <div className="upload-page-container bg-light">
      <div className="upload-card">
        <UploadIcon />
        <h1 className="font-primary">Create Your Portfolio</h1>
        <p className="font-secondary text-secondary">
          Upload your resume (PDF, DOC, DOCX - max 10MB) and we'll help you generate a stunning portfolio website in minutes.
        </p>
        <form onSubmit={handleSubmit} className="upload-form">
          <label htmlFor="resumeUpload" className="file-upload-label">
            {fileName ? 'Change File' : 'Choose Resume File'}
          </label>
          <input 
            type="file" 
            id="resumeUpload" 
            onChange={handleFileChange} 
            accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          {fileName && <p className="file-name">Selected: {fileName}</p>}
          
          <button type="submit" className="btn btn-primary" disabled={isLoading || !selectedFile}>
            {isLoading ? 'Processing...' : 'Generate Portfolio'}
          </button>
          
          {isLoading && <p className="loading-message">Parsing your resume, please wait...</p>}
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
      <style jsx>{`
        .upload-page-container {
          background-image: url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2020&q=80');
          background-size: cover;
          background-position: center;
        }
        .upload-card {
            position: relative; /* For potential pseudo-elements or absolute positioned children */
            z-index: 1;
        }
        .upload-page-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(248, 249, 250, 0.85); /* Light overlay to ensure text readability */
            z-index: 0;
        }
      `}</style>
    </div>
  );
}

export default UploadPage;
