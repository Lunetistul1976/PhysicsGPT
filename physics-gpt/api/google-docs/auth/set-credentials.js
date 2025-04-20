// This is a Vercel serverless function that proxies requests to the backend API
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get the request body
    const { accessToken, refreshToken } = req.body;
    
    if (!accessToken) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    // Get the backend API URL from environment variable or use a default
    const backendUrl = process.env.BACKEND_API_URL || 'https://physics-gpt-backend.vercel.app/api';
    
    // Forward the request to the backend API
    const response = await fetch(`${backendUrl}/google-docs/auth/set-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ accessToken, refreshToken }),
    });
    
    // Get the response data
    const data = await response.json();
    
    // Set the content type header
    res.setHeader('Content-Type', 'application/json');
    
    // Send the response back to the client
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying request:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ error: 'Failed to set credentials' });
  }
}; 