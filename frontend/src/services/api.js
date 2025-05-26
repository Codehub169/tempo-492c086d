import axios from 'axios';

const API_URL = '/api'; // Assuming backend is served on the same domain/port

/**
 * Uploads the resume file to the backend.
 * @param {File} file - The resume file to upload.
 * @returns {Promise<Object>} A promise that resolves with the portfolio data.
 */
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);

  try {
    // The backend is expected to process the resume and return the full portfolio data structure
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Expects portfolio data in response, matching PreviewPage's needs
  } catch (error) {
    console.error('Error uploading resume:', error.response ? error.response.data : error.message);
    // Rethrow a more user-friendly error or the specific error from backend
    const errorMessage = error.response?.data?.error || 'Failed to upload resume. Please check the file and try again.';
    throw new Error(errorMessage);
  }
};

/**
 * Placeholder function to download the generated portfolio website files.
 * In a real scenario, this might trigger a download from a specific backend endpoint.
 * @param {string} portfolioId - The ID of the portfolio to download (if applicable, though current flow doesn't use ID yet).
 * @returns {Promise<void>}
 */
export const downloadPortfolioFiles = async (portfolioId) => {
  // This is a placeholder. Actual implementation would depend on how the backend serves files.
  // For example, it might be a GET request to an endpoint like /api/download_portfolio/${portfolioId}
  // which would return a zip file.
  console.log('Attempting to download portfolio files. ID (if any):', portfolioId);
  // Example: window.location.href = `${API_URL}/download_portfolio`; // if no ID needed or ID managed by session
  alert('Download functionality is not yet implemented on the backend.');
  return Promise.resolve(); // Simulating a successful call for now
};

// Further API service functions can be added here as the application grows.
// For instance, if portfolio data needed to be fetched separately after an initial ID was returned:
// export const getPortfolioData = async (resumeId) => { 
//   try {
//     const response = await axios.get(`${API_URL}/portfolio/${resumeId}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching portfolio data:', error.response ? error.response.data : error.message);
//     throw error.response ? error.response.data : new Error('Failed to fetch portfolio data.');
//   }
// };
