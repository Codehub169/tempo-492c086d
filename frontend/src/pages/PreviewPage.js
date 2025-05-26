import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import { fetchPortfolioData } from '../services/api'; // To be implemented

// Simple SVG Icons
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
  </svg>
);

function PreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate a stable random signature for the profile picture for the current view
  const profilePicRandomSig = useMemo(() => Math.random(), []);

  useEffect(() => {
    const dataFromState = location.state?.resumeData;

    if (dataFromState) {
      if (dataFromState.error) { // Check if backend returned an error object
        setError(dataFromState.error);
        setPortfolioData(null);
      } else {
        setPortfolioData(dataFromState);
        setError(null); // Clear any previous errors
      }
    } else {
      // This case might happen if navigated directly to /preview or state is lost
      setError('No portfolio data found. Please upload a resume first.');
      setPortfolioData(null);
    }
    setIsLoading(false);
  }, [location.state]);

  const handleDownload = () => {
    alert('Download functionality to be implemented!');
    // In a real application, this might call an API endpoint:
    // import { downloadPortfolioFiles } from '../services/api';
    // downloadPortfolioFiles(portfolioData.id_or_some_identifier);
    console.log('Downloading website files...');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return <div className="container" style={{ textAlign: 'center', padding: '3rem', fontFamily: 'Roboto, sans-serif', color: '#007bff' }} aria-live="polite">Loading Portfolio Preview...</div>;
  }

  if (error) {
    return (
      <div className="container error-message" style={{ textAlign: 'center', padding: '3rem' }} role="alert">
        {error} 
        <button onClick={handleGoBack} className='btn btn-primary' style={{marginTop: '1rem', marginLeft: '10px'}}>
          Try Again
        </button>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '3rem', fontFamily: 'Roboto, sans-serif' }}>
        No portfolio data available. 
        <button onClick={handleGoBack} className='btn btn-primary' style={{marginTop: '1rem', marginLeft: '10px'}}>
          Generate New
        </button>
      </div>
    );
  }

  // Destructure for easier access, providing defaults for all expected fields
  const {
    fullName = 'N/A',
    jobTitle = 'N/A',
    contact = {},
    summary = 'No summary provided.',
    experience = [],
    education = [],
    skills = []
  } = portfolioData;

  const renderMultiLineText = (text, keyPrefix) => {
    if (!text) return null;
    return text.split('\n').map((line, i, arr) => (
      <React.Fragment key={`${keyPrefix}-${i}`}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="preview-page-container container">
      <div className="preview-header">
        <h1 className="font-primary">Portfolio Preview</h1>
        <div>
          <button onClick={handleGoBack} className="btn btn-secondary" style={{ marginRight: '10px' }}>
            Upload New Resume
          </button>
          <button onClick={handleDownload} className="btn btn-accent">
            <DownloadIcon /> Download Website Files
          </button>
        </div>
      </div>

      <div className="portfolio-placeholder">
        <section className="portfolio-section" style={{ textAlign: 'center', backgroundColor: '#007bff', color: 'white', padding: '3rem 1rem', borderRadius: '8px 8px 0 0' }}>
          <img 
            src={`https://source.unsplash.com/random/150x150/?portrait,person&sig=${profilePicRandomSig}`}
            alt={`Profile of ${fullName}`}
            style={{ width: '150px', height: '150px', borderRadius: '50%', border: '5px solid white', marginBottom: '1rem', objectFit: 'cover' }} 
          />
          <h1 style={{ fontSize: '2.8rem', margin: '0.5rem 0', color: 'white' }} className="font-primary">{fullName}</h1>
          <p style={{ fontSize: '1.5rem', margin: '0', color: '#e0e0e0' }} className="font-secondary">{jobTitle}</p>
        </section>

        <section className="portfolio-section">
          <h2>About Me</h2>
          <p>{renderMultiLineText(summary, 'summary') || 'No summary provided.'}</p>
        </section>

        <section className="portfolio-section">
          <h2>Contact Information</h2>
          <p><strong>Email:</strong> {contact.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {contact.phone || 'N/A'}</p>
          {contact.linkedin && <p><strong>LinkedIn:</strong> <a href={`https://${contact.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">{contact.linkedin.replace(/^https?:\/\//, '')}</a></p>}
          {contact.github && <p><strong>GitHub:</strong> <a href={`https://${contact.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">{contact.github.replace(/^https?:\/\//, '')}</a></p>}
        </section>

        <section className="portfolio-section">
          <h2>Work Experience</h2>
          {experience.length > 0 ? experience.map((exp, index) => (
            <div key={`exp-${index}`} style={{ marginBottom: '1.5rem' }}>
              {typeof exp === 'string' ? (
                <p>{renderMultiLineText(exp, `exp-str-${index}`)}</p>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.3rem', color: '#0056b3' }} className="font-primary">
                    {exp.title || 'Job Title'} at {exp.company || 'Company'}
                  </h3>
                  {exp.duration && <p style={{ fontStyle: 'italic', color: '#6c757d' }} className="font-secondary">{exp.duration}</p>}
                  {exp.description && <p>{renderMultiLineText(exp.description, `exp-desc-${index}`)}</p>}
                </>
              )}
            </div>
          )) : <p>No work experience provided.</p>}
        </section>

        <section className="portfolio-section">
          <h2>Education</h2>
          {education.length > 0 ? education.map((edu, index) => (
            <div key={`edu-${index}`} style={{ marginBottom: '1rem' }}>
              {typeof edu === 'string' ? (
                <p>{renderMultiLineText(edu, `edu-str-${index}`)}</p>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.3rem', color: '#0056b3' }} className="font-primary">
                    {edu.degree || 'Degree'}
                  </h3>
                  <p style={{ fontStyle: 'italic', color: '#6c757d' }} className="font-secondary">
                    {edu.institution || 'Institution'} {edu.year && `- ${edu.year}`}
                  </p>
                  {/* If education items can have descriptions like experience */}
                  {/* {edu.description && <p>{renderMultiLineText(edu.description, `edu-desc-${index}`)}</p>} */}
                </>
              )}
            </div>
          )) : <p>No education details provided.</p>}
        </section>

        <section className="portfolio-section">
          <h2>Skills</h2>
          {skills.length > 0 ? (
            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingLeft: '0', listStyle: 'none' }}>
              {skills.map((skill, index) => (
                <li key={`skill-${index}`} style={{ backgroundColor: '#e9ecef', color: '#007bff', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem' }} className="font-secondary">
                  {skill}
                </li>
              ))}
            </ul>
          ) : <p>No skills listed.</p>}
        </section>
      </div>
    </div>
  );
}

export default PreviewPage;
