const nodemailer = require("nodemailer");

let transporter;
let emailConfigured = false;

// Initialize email transporter
const initializeTransporter = () => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.warn("Email credentials not provided. Email sending will be disabled.");
            return false;
        }

        const emailDomain = process.env.EMAIL_USER.split('@')[1];
        let service = 'gmail'; // Default to Gmail

        if (emailDomain === 'outlook.com' || emailDomain === 'hotmail.com') {
            service = 'outlook';
        } else if (emailDomain === 'yahoo.com') {
            service = 'yahoo';
        }

        transporter = nodemailer.createTransport({
            service: service,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Verify the connection
        transporter.verify((error) => {
            if (error) {
                console.error("Email configuration error:", error);
                
                // Try alternative SMTP configuration for Gmail
                if (service === 'gmail') {
                    transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASSWORD
                        }
                    });

                    transporter.verify((err) => {
                        emailConfigured = !err;
                        if (err) {
                            console.error("Alternative SMTP configuration failed:", err);
                        } else {
                            console.log("Alternative SMTP configuration successful");
                        }
                    });
                }
            } else {
                emailConfigured = true;
                console.log("Email server is ready");
            }
        });

        return true;
    } catch (error) {
        console.error("Error setting up email transport:", error);
        return false;
    }
};

// Initialize the transporter
initializeTransporter();

const sendEmail = async (to, subject, text, html) => {
    if (!emailConfigured) {
        console.warn("Email service not configured. Email will not be sent.");
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
        if (error.code === 'EAUTH') {
            console.error("Authentication error. Check your email credentials.");
        } else if (error.code === 'ESOCKET') {
            console.error("Socket error. Check your network connection.");
        }
        return false;
    }
};

module.exports = {
    sendEmail
}; 