# Hokage Anime

A full-stack anime streaming platform with user authentication, favorites, and watch later functionality.

## Features

- User authentication (Email/Password and Google OAuth)
- Anime browsing and streaming
- Favorites and Watch Later lists
- Password reset with email verification
- Dark/Light mode toggle
- Responsive design

## Tech Stack

- **Frontend**: React, Bootstrap
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT, Passport.js, Google OAuth
- **Email**: Nodemailer

## Local Development

1. Clone the repository:
   ```
   git clone <repository-url>
   cd hokage-anime
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. Set up environment variables:
   - Create a `.env` file in the `backend` directory with the variables listed in `backend/README.md`

4. Start the development servers:
   ```
   npm run dev
   ```
   This will start both the frontend (port 3000) and backend (port 5001) servers.

## Deployment on Render

This project is configured for easy deployment on [Render](https://render.com/).

### Manual Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - **Environment**: Node
   - **Build Command**: `npm install && npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
   - **Start Command**: `npm start`
4. Add the required environment variables:
   - `NODE_ENV`: Set to `production`
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secret key for JWT tokens
   - `YOUTUBE_API_KEY`: Your YouTube API key
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `EMAIL_USER`: Your Gmail address for sending password reset emails
   - `EMAIL_PASSWORD`: Your Gmail app password
5. Click "Create Web Service"

### Troubleshooting Deployment Issues

If you encounter issues during deployment, check the following:

1. **Module not found errors**:
   - Make sure all dependencies are properly installed during the build process
   - Check that the build command includes installing dependencies for both frontend and backend

2. **Path issues**:
   - Ensure that file paths are correct for the production environment
   - The backend should correctly serve the frontend build files

3. **Environment variables**:
   - Verify all required environment variables are set in the Render dashboard
   - Check that the application correctly accesses these variables

4. **Google OAuth**:
   - After deployment, update your Google OAuth credentials with the new callback URL:
     - Go to [Google Cloud Console](https://console.cloud.google.com/)
     - Navigate to your project's OAuth consent screen
     - Add your Render deployment URL to the authorized redirect URIs:
       - `https://your-app-name.onrender.com/auth/google/callback`

5. **Email Configuration**:
   - Make sure your Gmail account has:
     - 2-Step Verification enabled
     - An App Password generated for this application

## License

This project is licensed under the ISC License. 