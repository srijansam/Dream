# Troubleshooting Guide for Render Deployment

This guide addresses common issues that may occur when deploying the Hokage Anime application on Render.

## Google Sign-in Issues

If Google Sign-in shows "not allowed" or doesn't work:

1. **Update Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to your project > "APIs & Services" > "Credentials"
   - Edit your OAuth 2.0 Client ID
   - Add your Render URL to "Authorized JavaScript origins":
     ```
     https://your-app-name.onrender.com
     ```
   - Add your callback URL to "Authorized redirect URIs":
     ```
     https://your-app-name.onrender.com/auth/google/callback
     ```

2. **Check Environment Variables**:
   - Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correctly set in Render
   - Verify `CALLBACK_URL` is set to your Render application URL (without trailing slash)

3. **Verify Callback URL Format**:
   - The callback URL should match exactly what's configured in Google Cloud Console
   - No extra slashes or parameters should be present

## YouTube Videos Not Displaying

If YouTube videos aren't showing:

1. **Check YouTube API Key**:
   - Verify your `YOUTUBE_API_KEY` is correctly set in Render
   - Check if the API key has the necessary permissions for YouTube Data API v3
   - Look for quota limits in the Google Cloud Console

2. **Inspect Network Requests**:
   - Open browser developer tools (F12) and check the Network tab
   - Look for requests to YouTube API or embed URLs
   - Check for CORS errors or other issues

3. **Check Console Logs**:
   - Review your Render logs for YouTube API errors
   - Look for messages about fetching YouTube data

4. **Manually Trigger Data Fetch**:
   - You can manually trigger the YouTube data fetch by restarting your service

## Email Issues

If password reset emails aren't being sent:

1. **Email Provider Settings**:
   - For Gmail:
     - Ensure 2-Step Verification is enabled
     - Generate an App Password specifically for this application
     - Use the App Password in your `EMAIL_PASSWORD` environment variable

   - For Outlook/Hotmail:
     - Enable "Less secure app access" in your Microsoft account
     - Or generate an app password if using 2-Step Verification

2. **Environment Variables**:
   - Verify `EMAIL_USER` is set to your full email address
   - Verify `EMAIL_PASSWORD` is set to your app password (not your regular password)

3. **Check Logs**:
   - Review Render logs for email configuration errors
   - Look for authentication errors or connection issues

4. **Test Alternative Email Provider**:
   - If Gmail doesn't work, try using Outlook, Yahoo, or another provider
   - Update both `EMAIL_USER` and `EMAIL_PASSWORD` accordingly

## General Troubleshooting

1. **Check All Environment Variables**:
   - Ensure all required environment variables are set in Render
   - Variables are case-sensitive

2. **Review Render Logs**:
   - Check for any errors during build or runtime
   - Look for specific error messages related to your issue

3. **Restart Your Service**:
   - Sometimes a simple restart can resolve issues
   - In Render dashboard, go to your service and click "Manual Deploy" > "Deploy latest commit"

4. **Clear Browser Cache**:
   - Clear your browser cache and cookies
   - Try accessing the application in an incognito/private window

5. **Check for CORS Issues**:
   - If you see CORS errors in the console, ensure your backend is properly configured
   - The current setup should handle CORS correctly in production

## Getting Additional Help

If you continue to experience issues:

1. Check the Render documentation: https://render.com/docs
2. Review the specific documentation for the technologies you're using (MongoDB, Express, React, Node.js)
3. Search for similar issues on Stack Overflow or GitHub
4. Contact Render support if you believe it's a platform-specific issue 