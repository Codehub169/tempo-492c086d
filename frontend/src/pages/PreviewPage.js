import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

  const profilePicRandomSig = useMemo(() => Math.random(), []);

  useEffect(() => {
    const dataFromState = location.state?.resumeData;

    if (dataFromState) {
      if (dataFromState.error) {
        setError(dataFromState.error);
        setPortfolioData(null);
      } else {
        setPortfolioData(dataFromState);
        setError(null);
      }
    } else {
      setError('No portfolio data found. Please upload a resume first.');
      setPortfolioData(null);
    }
    setIsLoading(false);
  }, [location.state]);

  const handleDownload = () => {
    alert('Download functionality to be implemented!');
    console.log('Downloading website files...');
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const renderMultiLineText = (text, keyPrefix) => {
    if (!text) return null;
    return text.split('\n').map((line, i, arr) => (
      <React.Fragment key={`${keyPrefix}-${i}`}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (isLoading) {
    return <div className="container preview-loading" aria-live="polite">Loading Portfolio Preview...</div>;
  }

  if (error) {
    return (
      <div className="container error-message preview-error" role="alert">
        {error} 
        <button onClick={handleGoBack} className='btn btn-primary preview-try-again-btn'>
          Try Again
        </button>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="container preview-no-data">
        No portfolio data available. 
        <button onClick={handleGoBack} className='btn btn-primary preview-generate-new-btn'>
          Generate New
        </button>
      </div>
    );
  }

  const {
    fullName = 'N/A',
    jobTitle = 'N/A',
    contact = {},
    summary = 'No summary provided.',
    experience = [],
    education = [],
    skills = []
  } = portfolioData;

  return (
    <div className="preview-page-container container">
      <div className="preview-actions-header">
        <h1 className="font-primary preview-main-title">Portfolio Preview</h1>
        <div className="preview-buttons">
          <button onClick={handleGoBack} className="btn btn-secondary preview-nav-btn">
            Upload New Resume
          </button>
          <button onClick={handleDownload} className="btn btn-accent preview-nav-btn">
            <DownloadIcon /> Download Website Files
          </button>
        </div>
      </div>

      <div className="portfolio-preview-content">
        {/* Mimicking portfolio_base.html structure with classes for App.css */}
        <section className="preview-hero-section">
          <img 
            src={`https://source.unsplash.com/random/150x150/?portrait,person&sig=${profilePicRandomSig}`}
            alt={`Profile of ${fullName}`}
            className="preview-profile-image"
          />
          <h1 className="preview-user-name font-primary">{fullName}</h1>
          <p className="preview-user-title font-secondary">{jobTitle}</p>
        </section>

        {summary && summary !== 'No summary provided.' && (
          <section className="portfolio-section preview-section">
            <h2 className="preview-section-title">About Me</h2>
            <p className="preview-summary-text">{renderMultiLineText(summary, 'summary')}</p>
          </section>
        )}

        <section className="portfolio-section preview-section">
          <h2 className="preview-section-title">Contact Information</h2>
          <div className="preview-contact-details">
            {contact.email && <p><strong>Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>}
            {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
            {contact.linkedin && <p><strong>LinkedIn:</strong> <a href={`https://${contact.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">{contact.linkedin.replace(/^https?:\/\//, '')}</a></p>}
            {contact.github && <p><strong>GitHub:</strong> <a href={`https://${contact.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">{contact.github.replace(/^https?:\/\//, '')}</a></p>}
            {!contact.email && !contact.phone && !contact.linkedin && !contact.github && <p>No contact details provided.</p>}
          </div>
        </section>

        <section className="portfolio-section preview-section">
          <h2 className="preview-section-title">Work Experience</h2>
          {experience.length > 0 ? experience.map((exp, index) => (
            <div key={`exp-${index}`} className="preview-item-card">
              {typeof exp === 'string' ? (
                <p className="preview-fallback-text">{renderMultiLineText(exp, `exp-str-${index}`)}</p>
              ) : (
                <>
                  <h3 className="preview-item-title font-primary">
                    {exp.title || 'Job Title'} {exp.company && `at ${exp.company}`}
                  </h3>
                  {exp.period && <p className="preview-item-meta font-secondary">{exp.period}</p>}
                  {exp.description && <p className="preview-item-description">{renderMultiLineText(exp.description, `exp-desc-${index}`)}</p>}
                </>
              )}
            </div>
          )) : <p>No work experience provided.</p>}
        </section>

        <section className="portfolio-section preview-section">
          <h2 className="preview-section-title">Education</h2>
          {education.length > 0 ? education.map((edu, index) => (
            <div key={`edu-${index}`} className="preview-item-card">
              {typeof edu === 'string' ? (
                <p className="preview-fallback-text">{renderMultiLineText(edu, `edu-str-${index}`)}</p>
              ) : (
                <>
                  <h3 className="preview-item-title font-primary">
                    {edu.degree || 'Degree'}
                  </h3>
                  <p className="preview-item-meta font-secondary">
                    {edu.institution || 'Institution'} {edu.period && `- ${edu.period}`}
                  </p>
                  {edu.description && <p className="preview-item-description">{renderMultiLineText(edu.description, `edu-desc-${index}`)}</p>}
                </>
              )}
            </div>
          )) : <p>No education details provided.</p>}
        </section>

        <section className="portfolio-section preview-section">
          <h2 className="preview-section-title">Skills</h2>
          {skills.length > 0 ? (
            <ul className="preview-skills-list">
              {skills.map((skill, index) => (
                <li key={`skill-${index}`} className="preview-skill-tag font-secondary">
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
