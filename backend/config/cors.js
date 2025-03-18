const corsOptions = {
    origin: process.env.NODE_ENV === "production" 
        ? process.env.FRONTEND_URL || "https://hokagee.onrender.com"
        : "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = corsOptions; 