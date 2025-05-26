import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import PreviewPage from './pages/PreviewPage';
import './App.css';

function App() {
  return (
    <Router>
      {/* Optional: Global Header can be added here */}
      {/* <header className="app-header">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 className="app-title">Resume to Portfolio</h1>
        </Link>
      </header> */}
      <main>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          {/* Fallback route for unmatched paths - redirect to home or a 404 component */}
          <Route path="*" element={<UploadPage />} /> 
        </Routes>
      </main>
      {/* Optional: Global Footer can be added here */}
      {/* <footer style={{ textAlign: 'center', padding: '1rem', marginTop: '2rem', backgroundColor: '#343a40', color: 'white', fontFamily: 'Roboto, sans-serif' }}>
        <p>&copy; {new Date().getFullYear()} Resume to Portfolio Generator. All rights reserved.</p>
      </footer> */}
    </Router>
  );
}

export default App;
