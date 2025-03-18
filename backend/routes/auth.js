const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ResetToken = require("../models/ResetToken");
const { sendEmail } = require("../services/email");
const authenticateToken = require("../middleware/auth");

// Register
router.post("/register", async (req, res) => {
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

// Login
router.post("/login", async (req, res) => {
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

// Google OAuth routes
router.get("/google", passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account"
}));

router.get("/google/callback", 
    passport.authenticate("google", { 
        failureRedirect: "/?error=google_auth_failed" 
    }), 
    (req, res) => {
        try {
            const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            const redirectURL = process.env.NODE_ENV === "production" 
                ? `${process.env.FRONTEND_URL}/auth/google/callback?token=${token}` 
                : `http://localhost:3000/auth/google/callback?token=${token}`;
            return res.redirect(redirectURL);
        } catch (err) {
            console.error("JWT generation or redirection error:", err);
            return res.redirect("/?error=token_error");
        }
    }
);

// Get user info
router.get("/user", async (req, res) => {
    try {
        let user = null;
        let authMethod = null;

        if (req.isAuthenticated()) {
            user = req.user;
            authMethod = 'google';
        } else {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                return res.status(401).json({ 
                    message: "Authentication required", 
                    details: "No authentication token provided" 
                });
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.userId);
                authMethod = 'jwt';
            } catch (error) {
                return res.status(401).json({ 
                    message: "Invalid or expired token", 
                    details: error.message 
                });
            }
        }

        if (!user) {
            return res.status(404).json({ 
                message: "User not found", 
                details: "The user associated with this token no longer exists" 
            });
        }

        res.json({ 
            name: user.name, 
            email: user.email,
            googleId: user.googleId || null,
            authMethod
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Server error", 
            details: error.message 
        });
    }
});

// Logout
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: "Logout failed", error: err });

        req.session.destroy((err) => {
            if (err) return res.status(500).json({ message: "Session destruction failed", error: err });

            res.clearCookie("connect.sid");
            res.json({ message: "Logged out successfully" });
        });
    });
});

// Change password
router.post("/change-password", authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.googleId) {
            return res.status(400).json({ message: "Google users cannot change their password here" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        
        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Forgot password routes
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }
        
        if (user.googleId) {
            return res.status(400).json({ 
                message: "This account uses Google Sign-In. Please reset your password through Google." 
            });
        }
        
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedToken = await bcrypt.hash(verificationCode, 10);
        
        await ResetToken.deleteMany({ email });
        await new ResetToken({ email, token: hashedToken }).save();
        
        const emailSent = await sendEmail(
            email,
            "Password Reset Verification Code",
            `Your verification code is: ${verificationCode}. It will expire in 1 hour.`,
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #333; text-align: center;">Password Reset</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your Hokage Anime account. Please use the verification code below to complete the process:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                    <h3 style="margin: 0; color: #e53935; letter-spacing: 2px;">${verificationCode}</h3>
                </div>
                <p>This code will expire in 1 hour.</p>
                <p>If you didn't request a password reset, you can safely ignore this email.</p>
                <p>Best regards,<br>The Hokage Anime Team</p>
            </div>`
        );
        
        if (emailSent) {
            res.json({ message: "Verification code sent to your email" });
        } else {
            console.log(`Verification code for ${email}: ${verificationCode}`);
            res.json({ 
                message: "Verification code generated. Check console for the code (email sending failed)." 
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.post("/verify-reset-code", async (req, res) => {
    try {
        const { email, code } = req.body;
        
        const resetToken = await ResetToken.findOne({ email });
        if (!resetToken) {
            return res.status(400).json({ 
                message: "Verification code has expired or is invalid" 
            });
        }
        
        const isValid = await bcrypt.compare(code, resetToken.token);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        
        res.json({ message: "Code verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        
        const resetToken = await ResetToken.findOne({ email });
        if (!resetToken) {
            return res.status(400).json({ 
                message: "Verification code has expired or is invalid" 
            });
        }
        
        const isValid = await bcrypt.compare(code, resetToken.token);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid verification code" });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        
        await ResetToken.deleteOne({ _id: resetToken._id });
        
        res.json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router; 