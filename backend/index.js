const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const session = require("express-session");
const passportGoogle = require("passport-google-oauth20").Strategy;
const axios = require("axios");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === "production" 
        ? process.env.FRONTEND_URL || "https://hokage-4027.onrender.com"
        : "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Session configuration
app.use(session({ 
    secret: process.env.JWT_SECRET || "secret", 
    resave: false, 
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax'
    }
}));

// Serve static files from the React frontend app in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/build")));
}

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
.catch(err => console.log("MongoDB Connection Error:", err));

// Password Reset Token Schema
const resetTokenSchema = new mongoose.Schema({
    email: { type: String, required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Token expires after 1 hour
});
const ResetToken = mongoose.model("ResetToken", resetTokenSchema);

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    googleId: String
});
const User = mongoose.model("User", userSchema);

// Anime Schema
const animeSchema = new mongoose.Schema({
    title: String,
    description: String,
    youtubeEmbedUrl: String
});
const Anime = mongoose.model("Anime", animeSchema);

// Favorite Anime Schema

const FavouriteAnimeSchema = new mongoose.Schema({
    userId: String,
    animeId: String,
    title: String,
    description: String,
    youtubeEmbedUrl: String
});
const FavouriteAnime = mongoose.model("FavouriteAnime", FavouriteAnimeSchema);

///////WAtch-Later Schema
const WatchLaterSchema = new mongoose.Schema({
    userId: String,
    animeId: String,
    title: String,
    description: String,
    youtubeEmbedUrl: String
});
const WatchLater = mongoose.model("WatchLater", WatchLaterSchema);
// Register API
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.json({ message: "User registered successfully" });
    } catch (err) {
        res.status(400).json({ message: "Error registering user", error: err });
    }
});

// Login API
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err });
    }
});
// // Google OAuth
app.use(passport.initialize());
app.use(passport.session());

// Set the callback URL based on environment
const callbackURL = process.env.NODE_ENV === "production" 
  ? `${process.env.CALLBACK_URL}/auth/google/callback` 
  : "http://localhost:5001/auth/google/callback";

console.log("Google OAuth callback URL:", callbackURL);

passport.use(new passportGoogle({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("Google profile received:", profile.id, profile.displayName);
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            console.log("Creating new user for Google account");
            user = new User({ 
                name: profile.displayName, 
                email: profile.emails[0].value, 
                googleId: profile.id 
            });
            await user.save();
        }
        return done(null, user);
    } catch (error) {
        console.error("Error in Google authentication:", error);
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

app.get("/auth/google", passport.authenticate("google", { 
  scope: ["profile", "email"],
  prompt: "select_account"
}));

app.get("/auth/google/callback", 
  function(req, res, next) {
    passport.authenticate("google", function(err, user, info) {
      if (err) {
        console.error("Google auth error:", err);
        return res.redirect("/?error=google_auth_error");
      }
      
      if (!user) {
        console.error("Google auth failed, no user:", info);
        return res.redirect("/?error=google_auth_failed");
      }
      
      req.logIn(user, function(err) {
        if (err) {
          console.error("Login error:", err);
          return res.redirect("/?error=login_error");
        }
        
        // Generate JWT token for Google authenticated user
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        
        // Redirect to frontend with token
        const redirectURL = process.env.NODE_ENV === "production" 
          ? `/auth/google/callback?token=${token}` 
          : `http://localhost:3000/auth/google/callback?token=${token}`;
        
        console.log("Google auth successful, redirecting to:", redirectURL);
        return res.redirect(redirectURL);
      });
    })(req, res, next);
  }
);

/////auth token
const authenticateToken = (req, res, next) => {
    // Check if user is authenticated via Google OAuth (session-based)
    if (req.isAuthenticated()) {
        req.user = { userId: req.user._id };
        return next();
    }

    // Check for JWT token
    const token = req.headers.authorization?.split(" ")[1]; // Extract token
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden" });
        req.user = user;
        next();
    });
};


// Fetch and store anime from YouTube
const fetchAndStoreAnime = async () => {
    try {
        console.log("Starting YouTube data fetch...");
        
        // Check if YouTube API key is available
        if (!process.env.YOUTUBE_API_KEY) {
            console.error("YouTube API key is missing. Please set the YOUTUBE_API_KEY environment variable.");
            return;
        }

        const CHANNEL_ID = "UCP8E_gJhRMApuQYOQ21MkLA";
        console.log("Using channel ID:", CHANNEL_ID);
        
        let nextPageToken = "";
        let videos = [];
        const BASE_URL = "https://www.googleapis.com/youtube/v3/search";
        const MAX_VIDEOS = 50;
        const MAX_RETRIES = 3;

        // First, verify the channel exists
        try {
            const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
                params: {
                    key: process.env.YOUTUBE_API_KEY,
                    id: CHANNEL_ID,
                    part: 'snippet'
                }
            });
            
            if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
                console.error("Channel not found. Please verify the channel ID.");
                return;
            }
            
            console.log("Channel found:", channelResponse.data.items[0].snippet.title);
        } catch (channelError) {
            console.error("Error verifying channel:", channelError.response?.data || channelError.message);
            return;
        }

        while (videos.length < MAX_VIDEOS) {
            let retryCount = 0;
            let success = false;

            while (retryCount < MAX_RETRIES && !success) {
                try {
                    console.log(`Fetching YouTube data with token: ${nextPageToken || 'initial'} (Attempt ${retryCount + 1})`);
                    
                    const params = {
                        key: process.env.YOUTUBE_API_KEY,
                        channelId: CHANNEL_ID,
                        part: "snippet",
                        type: "video",
                        maxResults: 50,
                        order: "date",
                        ...(nextPageToken ? { pageToken: nextPageToken } : {})
                    };

                    console.log("Making API request with params:", {
                        channelId: params.channelId,
                        type: params.type,
                        part: params.part,
                        maxResults: params.maxResults,
                        order: params.order
                    });
                    
                    const response = await axios.get(BASE_URL, {
                        params,
                        timeout: 10000
                    });

                    if (!response.data.items || response.data.items.length === 0) {
                        console.log("No videos found in response");
                        if (response.data.error) {
                            console.error("API Error:", response.data.error);
                        }
                        break;
                    }

                    const newVideos = response.data.items.map(video => ({
                        title: video.snippet.title,
                        description: video.snippet.description,
                        youtubeEmbedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
                        thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url
                    }));
                    
                    videos.push(...newVideos);
                    console.log(`Fetched ${newVideos.length} new videos. Total videos: ${videos.length}`);
                    
                    nextPageToken = response.data.nextPageToken;
                    success = true;
                    
                    if (!nextPageToken) {
                        console.log("No next page token, ending fetch");
                        break;
                    }
                } catch (apiError) {
                    retryCount++;
                    if (apiError.response?.data?.error?.errors) {
                        console.error("YouTube API Error:", apiError.response.data.error.errors);
                    } else {
                        console.error(`Attempt ${retryCount} failed:`, apiError.message);
                    }
                    
                    if (retryCount === MAX_RETRIES) {
                        console.error("Max retries reached, stopping fetch");
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
                }
            }

            if (!success) break;
        }

        if (videos.length > 0) {
            console.log(`Storing ${videos.length} videos in database...`);
            await Anime.deleteMany();
            await Anime.insertMany(videos);
            console.log(`YouTube data stored successfully! Total videos: ${videos.length}`);
        } else {
            console.error("No videos were fetched from YouTube API. Please check:");
            console.error("1. YouTube API key is valid");
            console.error("2. Channel ID is correct");
            console.error("3. API quota is not exhausted");
            console.error("4. Channel has public videos");
        }
    } catch (err) {
        console.error("Error fetching YouTube data:", err);
        if (err.response?.data?.error) {
            console.error("YouTube API Error Details:", err.response.data.error);
        }
        throw err;
    }
};

// Initial startup check for anime data
(async () => {
    try {
        const count = await Anime.countDocuments();
        if (count === 0) {
            console.log("No anime data found on startup, initiating initial fetch...");
            await fetchAndStoreAnime();
        } else {
            console.log(`Found ${count} existing anime entries`);
        }
    } catch (err) {
        console.error("Error during startup anime check:", err);
    }
})();

// Add manual refresh endpoint
app.get("/refresh-anime", async (req, res) => {
    try {
        console.log("Manual refresh of anime data initiated");
        await fetchAndStoreAnime();
        res.json({ message: "Anime data refresh completed" });
    } catch (err) {
        console.error("Error in manual refresh:", err);
        res.status(500).json({ message: "Error refreshing anime data", error: err });
    }
});

// Get all anime with auto-fetch if empty
app.get("/anime", async (req, res) => {
    try {
        let animeList = await Anime.find();
        
        // If no anime data exists, fetch it first
        if (!animeList || animeList.length === 0) {
            console.log("No anime data found, initiating fetch...");
            await fetchAndStoreAnime();
            animeList = await Anime.find();
        }
        
        res.json(animeList);
    } catch (err) {
        console.error("Error in /anime route:", err);
        res.status(500).json({ message: "Error fetching anime", error: err });
    }
});

app.get("/favourite_anime", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const favorites = await FavouriteAnime.find({ userId });
        res.json(favorites);
    } catch (err) {
        console.error("Error fetching favourite anime:", err);
        res.status(500).json({ message: "Error fetching favourite anime", error: err });
    }
});

app.post("/favourite_anime", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { animeId, title, description, youtubeEmbedUrl } = req.body;

    const existing = await FavouriteAnime.findOne({ userId, animeId });
    if (existing) return res.status(400).json({ error: "Already in favourites" });

    const newFav = new FavouriteAnime({ userId, animeId, title, description, youtubeEmbedUrl });
    await newFav.save();
    res.json({ message: "Added to favourites" });
});

app.delete("/favourite_anime/:animeId", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    await FavouriteAnime.findOneAndDelete({ userId, animeId: req.params.animeId });
    res.json({ message: "Removed from favourites" });
});

app.get("/watch_later", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const watchLaterList = await WatchLater.find({ userId });
        res.json(watchLaterList);
    } catch (err) {
        console.error("Error fetching watch later anime:", err);
        res.status(500).json({ message: "Error fetching watch later anime", error: err });
    }
});

app.post("/watch_later", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { animeId, title, description, youtubeEmbedUrl } = req.body;

    try {
        const existing = await WatchLater.findOne({ userId, animeId });
        if (existing) return res.status(400).json({ error: "Already in watchlist" });

        const newEntry = new WatchLater({ userId, animeId, title, description, youtubeEmbedUrl });
        await newEntry.save();
        res.json({ message: "Added to watchlist" });
    } catch (err) {
        console.error("Error adding to watch later:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});

app.delete("/watch_later/:animeId", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        await WatchLater.findOneAndDelete({ userId, animeId: req.params.animeId });
        res.json({ message: "Removed from watchlist" });
    } catch (err) {
        console.error("Error removing from watch later:", err);
        res.status(500).json({ message: "Internal server error", error: err });
    }
});

///////////////////////////////////////////
app.get("/user", async (req, res) => {
    try {
        let user = null;
        let authMethod = null;

        // Check if user is authenticated via Google OAuth (session-based)
        if (req.isAuthenticated()) {
            console.log("User authenticated via Google OAuth");
            user = req.user;
            authMethod = 'google';
        }
        // Check JWT token for regular login users
        else {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                console.log("No token provided");
                return res.status(401).json({ 
                    message: "Authentication required", 
                    details: "No authentication token provided" 
                });
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.userId);
                authMethod = 'jwt';
                console.log("User authenticated via JWT");
            } catch (error) {
                console.error("JWT verification error:", error.message);
                return res.status(401).json({ 
                    message: "Invalid or expired token", 
                    details: error.message 
                });
            }
        }

        if (!user) {
            console.log("User not found in database");
            return res.status(404).json({ 
                message: "User not found", 
                details: "The user associated with this token no longer exists" 
            });
        }

        // Log successful authentication
        console.log(`User authenticated successfully via ${authMethod}:`, {
            id: user._id,
            name: user.name,
            email: user.email,
            isGoogleUser: !!user.googleId
        });

        res.json({ 
            name: user.name, 
            email: user.email,
            googleId: user.googleId || null,
            authMethod
        });
    } catch (error) {
        console.error("Unexpected error in /user route:", error);
        res.status(500).json({ 
            message: "Server error", 
            details: error.message 
        });
    }
});


app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: "Logout failed", error: err });

        req.session.destroy((err) => {
            if (err) return res.status(500).json({ message: "Session destruction failed", error: err });

            res.clearCookie("connect.sid"); // Clear session cookie
            res.json({ message: "Logged out successfully" });
        });
    });
});

app.listen(5001, () => console.log("Server running on port 5001"));

/////////////////////////////////////////////

// Change Password API
app.post("/change-password", authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is a Google user (has googleId)
        if (user.googleId) {
            return res.status(400).json({ message: "Google users cannot change their password here. Please use Google account settings." });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        user.password = hashedPassword;
        await user.save();
        
        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Email configuration
let transporter;
let emailConfigured = false;

try {
    // Check if email credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        // Determine email service based on the email address
        const emailDomain = process.env.EMAIL_USER.split('@')[1];
        let service = 'gmail'; // Default to Gmail
        
        // Configure for different email providers
        if (emailDomain === 'outlook.com' || emailDomain === 'hotmail.com') {
            service = 'outlook';
        } else if (emailDomain === 'yahoo.com') {
            service = 'yahoo';
        }
        
        console.log(`Setting up email with service: ${service} for domain: ${emailDomain}`);
        
        // Create transporter with appropriate service
        transporter = nodemailer.createTransport({
            service: service,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        // Test email configuration
        transporter.verify((error, success) => {
            if (error) {
                console.error("Email configuration error:", error);
                console.log("Email sending will be disabled. Please check your credentials.");
                
                // Try SMTP configuration as fallback for Gmail
                if (service === 'gmail') {
                    console.log("Trying alternative SMTP configuration for Gmail...");
                    transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASSWORD
                        }
                    });
                    
                    transporter.verify((err, success) => {
                        if (err) {
                            console.error("Alternative SMTP configuration also failed:", err);
                            emailConfigured = false;
                        } else {
                            console.log("Alternative SMTP configuration successful!");
                            emailConfigured = true;
                        }
                    });
                } else {
                    emailConfigured = false;
                }
            } else {
                console.log("Email server is ready to send messages");
                emailConfigured = true;
            }
        });
    } else {
        console.log("Email credentials not provided in .env file. Email sending will be disabled.");
        console.log("To enable email sending, add EMAIL_USER and EMAIL_PASSWORD to your .env file.");
        console.log("For Gmail, you need to use an App Password: https://support.google.com/accounts/answer/185833");
        emailConfigured = false;
    }
} catch (error) {
    console.error("Error setting up email transport:", error);
    emailConfigured = false;
}

// Helper function to send email
const sendEmail = async (to, subject, text, html) => {
    // If email is not configured, return false immediately
    if (!emailConfigured) {
        console.log("Email not sent because email service is not configured.");
        return false;
    }
    
    try {
        const mailOptions = {
            from: `"Hokage Anime" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        
        // Log detailed error information
        if (error.code === 'EAUTH') {
            console.error("Authentication error. Check your email credentials.");
        } else if (error.code === 'ESOCKET') {
            console.error("Socket error. Check your network connection and email service settings.");
        }
        
        return false;
    }
};

// Forgot Password - Request verification code
app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }
        
        // Check if user is a Google user
        if (user.googleId) {
            return res.status(400).json({ 
                message: "This account uses Google Sign-In. Please reset your password through Google." 
            });
        }
        
        // Generate a random 6-digit code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash the code before storing
        const hashedToken = await bcrypt.hash(verificationCode, 10);
        
        // Delete any existing tokens for this user
        await ResetToken.deleteMany({ email });
        
        // Save the new token
        await new ResetToken({
            email,
            token: hashedToken
        }).save();
        
        // Log the code for development purposes
        console.log(`Verification code for ${email}: ${verificationCode}`);
        
        // Send email with verification code
        const emailSubject = "Password Reset Verification Code";
        const emailText = `Your verification code is: ${verificationCode}. It will expire in 1 hour.`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #333; text-align: center;">Password Reset</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your Hokage Anime account. Please use the verification code below to complete the process:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <h3 style="margin: 0; color: #e53935; letter-spacing: 2px;">${verificationCode}</h3>
                </div>
                <p>This code will expire in 1 hour.</p>
                <p>If you didn't request a password reset, you can safely ignore this email.</p>
                <p>Best regards,<br>The Hokage Anime Team</p>
            </div>
        `;
        
        const emailSent = await sendEmail(email, emailSubject, emailText, emailHtml);
        
        if (emailSent) {
            res.json({ message: "Verification code sent to your email" });
        } else {
            // If email fails, still return success but log the error
            console.error("Failed to send email, but code was generated");
            res.json({ 
                message: "Verification code generated. Check console for the code (email sending failed)." 
            });
        }
    } catch (error) {
        console.error("Error in forgot-password:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Verify reset code
app.post("/verify-reset-code", async (req, res) => {
    try {
        const { email, code } = req.body;
        
        // Find the reset token
        const resetToken = await ResetToken.findOne({ email });
        if (!resetToken) {
            return res.status(400).json({ 
                message: "Verification code has expired or is invalid. Please request a new one." 
            });
        }
        
        // Verify the code
        const isValid = await bcrypt.compare(code, resetToken.token);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        
        res.json({ message: "Code verified successfully" });
    } catch (error) {
        console.error("Error in verify-reset-code:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Reset password
app.post("/reset-password", async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        
        // Find the reset token
        const resetToken = await ResetToken.findOne({ email });
        if (!resetToken) {
            return res.status(400).json({ 
                message: "Verification code has expired or is invalid. Please request a new one." 
            });
        }
        
        // Verify the code
        const isValid = await bcrypt.compare(code, resetToken.token);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        
        // Find the user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update the user's password
        user.password = hashedPassword;
        await user.save();
        
        // Delete the reset token
        await ResetToken.deleteOne({ _id: resetToken._id });
        
        res.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Error in reset-password:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Add this at the end of the file, after all other routes
// This route serves the React app in production
if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
    });
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
