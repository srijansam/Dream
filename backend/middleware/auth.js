const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    // Check if user is authenticated via Google OAuth (session-based)
    if (req.isAuthenticated()) {
        req.user = { userId: req.user._id };
        return next();
    }

    // Check for JWT token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden" });
        req.user = user;
        next();
    });
};

module.exports = authenticateToken; 