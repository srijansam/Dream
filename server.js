// This is a simple wrapper to run the backend/index.js file
// It's useful for deployment platforms that expect the main file to be in the root directory

console.log('Starting server from root directory wrapper...');
try {
  // Try to require the backend/index.js file
  require('./backend/index.js');
  console.log('Server started successfully!');
} catch (error) {
  console.error('Error starting server:', error);
  
  // If there's an error, try to start a minimal express server
  try {
    const express = require('express');
    const path = require('path');
    
    const app = express();
    const PORT = process.env.PORT || 3000;
    
    // Serve static files from the React frontend app
    app.use(express.static(path.join(__dirname, 'frontend/build')));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
    });
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (fallbackError) {
    console.error('Failed to start fallback server:', fallbackError);
  }
} 