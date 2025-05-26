import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // const uploadedFileName = location.state?.uploadedFileName;
    // if (!uploadedFileName) {
    //   // If no context, maybe redirect or show error
    //   // For now, we'll proceed to fetch generic data or show placeholders
    //   console.warn('No uploaded file context found.');
    // }

    // Simulate fetching portfolio data
    // In a real app, you'd fetch based on an ID or user session:
    // const fetchData = async () => {
    //   try {
    //     // const data = await fetchPortfolioData(someId); // someId from context or URL param
    //     // setPortfolioData(data);
    //   } catch (err) {
    //     setError('Failed to load portfolio preview. Please try generating again.');
    //     console.error('Fetch preview error:', err);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchData();

    // Simulate data loading
    setTimeout(() => {
      setPortfolioData({
        fullName: 'Jane Doe (Sample)',
        jobTitle: 'Full Stack Developer',
        contact: {
          email: 'jane.doe@example.com',
          phone: '123-456-7890',
          linkedin: 'linkedin.com/in/janedoe',
          github: 'github.com/janedoe'
        },
        summary: 'A passionate and results-oriented Full Stack Developer with 5+ years of experience in building and maintaining web applications using modern technologies. Proven ability to work in fast-paced environments and collaborate effectively with cross-functional teams.',
        experience: [
          { title: 'Senior Software Engineer', company: 'Tech Solutions Inc.', duration: 'Jan 2020 - Present', description: 'Led development of key features for a SaaS product. Mentored junior developers.' },
          { title: 'Software Developer', company: 'Web Wizards LLC', duration: 'Jun 2017 - Dec 2019', description: 'Developed and maintained client websites. Contributed to a CMS platform.' }
        ],
        education: [
          { degree: 'M.S. in Computer Science', institution: 'University of Technology', year: '2017' },
          { degree: 'B.S. in Software Engineering', institution: 'State College', year: '2015' }
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Flask', 'SQL', 'AWS', 'Docker']
      });
      setIsLoading(false);
    }, 1500);

  }, [location.state]);

  const handleDownload = () => {
    // Placeholder for download functionality
    // This would typically trigger an API call to get a ZIP of the static site
    alert('Download functionality to be implemented!');
    console.log('Downloading website files...');
  };

  const handleGoBack = () => {
    navigate('/'); // Navigate back to the upload page
  };

  if (isLoading) {
    return <div className="container" style={{ textAlign: 'center', padding: '3rem', fontFamily: 'Roboto, sans-serif', color: '#007bff' }}>Loading Portfolio Preview...</div>;
  }

  if (error) {
    return <div className="container error-message" style={{ textAlign: 'center', padding: '3rem' }}>{error} <button onClick={handleGoBack} className='btn btn-primary' style={{marginTop: '1rem'}}>Try Again</button></div>;
  }

  if (!portfolioData) {
    return <div className="container" style={{ textAlign: 'center', padding: '3rem', fontFamily: 'Roboto, sans-serif' }}>No portfolio data available. <button onClick={handleGoBack} className='btn btn-primary' style={{marginTop: '1rem'}}>Generate New</button></div>;
  }

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
        {/* Header Section (Mock) */}
        <section className="portfolio-section" style={{ textAlign: 'center', backgroundColor: '#007bff', color: 'white', padding: '3rem 1rem', borderRadius: '8px 8px 0 0' }}>
          <img src={`https://source.unsplash.com/random/150x150/?portrait,person&sig=${Math.random()}`} alt={portfolioData.fullName} style={{ width: '150px', height: '150px', borderRadius: '50%', border: '5px solid white', marginBottom: '1rem', objectFit: 'cover' }} />
          <h1 style={{ fontSize: '2.8rem', margin: '0.5rem 0', color: 'white' }} className="font-primary">{portfolioData.fullName}</h1>
          <p style={{ fontSize: '1.5rem', margin: '0', color: '#e0e0e0' }} className="font-secondary">{portfolioData.jobTitle}</p>
        </section>

        {/* About/Summary Section */}
        <section className="portfolio-section">
          <h2>About Me</h2>
          <p>{portfolioData.summary}</p>
        </section>

        {/* Contact Section */}
        <section className="portfolio-section">
          <h2>Contact Information</h2>
          <p><strong>Email:</strong> {portfolioData.contact.email}</p>
          <p><strong>Phone:</strong> {portfolioData.contact.phone}</p>
          {portfolioData.contact.linkedin && <p><strong>LinkedIn:</strong> <a href={`https://${portfolioData.contact.linkedin}`} target="_blank" rel="noopener noreferrer">{portfolioData.contact.linkedin}</a></p>}
          {portfolioData.contact.github && <p><strong>GitHub:</strong> <a href={`https://${portfolioData.contact.github}`} target="_blank" rel="noopener noreferrer">{portfolioData.contact.github}</a></p>}
        </section>

        {/* Experience Section */}
        <section className="portfolio-section">
          <h2>Work Experience</h2>
          {portfolioData.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0056b3' }} className="font-primary">{exp.title} at {exp.company}</h3>
              <p style={{ fontStyle: 'italic', color: '#6c757d' }} className="font-secondary">{exp.duration}</p>
              <p>{exp.description}</p>
            </div>
          ))}
        </section>

        {/* Education Section */}
        <section className="portfolio-section">
          <h2>Education</h2>
          {portfolioData.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#0056b3' }} className="font-primary">{edu.degree}</h3>
              <p style={{ fontStyle: 'italic', color: '#6c757d' }} className="font-secondary">{edu.institution} - {edu.year}</p>
            </div>
          ))}
        </section>

        {/* Skills Section */}
        <section className="portfolio-section">
          <h2>Skills</h2>
          <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', paddingLeft: '0', listStyle: 'none' }}>
            {portfolioData.skills.map((skill, index) => (
              <li key={index} style={{ backgroundColor: '#e9ecef', color: '#007bff', padding: '8px 15px', borderRadius: '20px', fontSize: '0.9rem' }} className="font-secondary">
                {skill}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default PreviewPage;
