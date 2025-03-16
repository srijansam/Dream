import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  // States for forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: Verification, 3: New Password
  const [resetMessage, setResetMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { email, password });
      localStorage.setItem("token", res.data.token);
      //alert("Login Successful");
      navigate("/home");
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  const handleGoogleLogin = () => {
    // For production, use the relative URL; for development, use the full URL
    const googleAuthUrl = process.env.NODE_ENV === 'production' 
      ? '/auth/google' 
      : 'http://localhost:5001/auth/google';
    
    console.log('Redirecting to Google auth:', googleAuthUrl);
    window.location.href = googleAuthUrl;
  };
  
  // Open forgot password modal
  const openForgotPassword = () => {
    setShowForgotPassword(true);
    setResetStep(1);
    setForgotPasswordEmail("");
    setVerificationCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetMessage({ text: "", type: "" });
  };
  
  // Close forgot password modal
  const closeForgotPassword = () => {
    setShowForgotPassword(false);
  };
  
  // Request verification code
  const requestVerificationCode = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setResetMessage({ text: "Please enter your email address", type: "danger" });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post("/forgot-password", { 
        email: forgotPasswordEmail 
      });
      setResetMessage({ text: "Verification code sent to your email", type: "success" });
      setResetStep(2);
    } catch (error) {
      setResetMessage({ 
        text: error.response?.data?.message || "Failed to send verification code", 
        type: "danger" 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Verify code and proceed to password reset
  const verifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setResetMessage({ text: "Please enter the verification code", type: "danger" });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post("/verify-reset-code", {
        email: forgotPasswordEmail,
        code: verificationCode
      });
      setResetMessage({ text: "Code verified successfully", type: "success" });
      setResetStep(3);
    } catch (error) {
      setResetMessage({ 
        text: error.response?.data?.message || "Invalid verification code", 
        type: "danger" 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset password
  const resetPassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!newPassword) {
      setResetMessage({ text: "Please enter a new password", type: "danger" });
      return;
    }
    
    if (newPassword.length < 6) {
      setResetMessage({ text: "Password must be at least 6 characters", type: "danger" });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setResetMessage({ text: "Passwords don't match", type: "danger" });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post("/reset-password", {
        email: forgotPasswordEmail,
        code: verificationCode,
        newPassword: newPassword
      });
      setResetMessage({ text: "Password reset successfully! You can now login with your new password.", type: "success" });
      
      // Close modal after 3 seconds
      setTimeout(() => {
        closeForgotPassword();
      }, 3000);
    } catch (error) {
      setResetMessage({ 
        text: error.response?.data?.message || "Failed to reset password", 
        type: "danger" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render the appropriate step in the forgot password flow
  const renderForgotPasswordStep = () => {
    switch (resetStep) {
      case 1:
        return (
          <form onSubmit={requestVerificationCode}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your registered email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
              />
              <small className="form-text text-muted">
                We'll send a verification code to this email.
              </small>
            </div>
            <div className="d-grid">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : "Send Verification Code"}
              </button>
            </div>
          </form>
        );
      
      case 2:
        return (
          <form onSubmit={verifyCode}>
            <div className="mb-3">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter the code sent to your email"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            <div className="d-grid">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Verifying...
                  </>
                ) : "Verify Code"}
              </button>
            </div>
          </form>
        );
      
      case 3:
        return (
          <form onSubmit={resetPassword}>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength="6"
                required
              />
              <small className="form-text text-muted">
                Password must be at least 6 characters long.
              </small>
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-grid">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Resetting...
                  </>
                ) : "Reset Password"}
              </button>
            </div>
          </form>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center vh-100 text-white" 
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('https://images3.alphacoders.com/144/144565.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="container text-center p-5 bg-dark bg-opacity-75 rounded shadow-lg" style={{ maxWidth: "400px" }}>
        <h2 className="mb-4 fw-bold">🔐 Login to Hokage</h2>

        <form onSubmit={handleLogin}>
          <div className="mb-3 text-start">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <div className="text-end mt-1">
              <button 
                type="button" 
                className="btn btn-link text-light p-0 text-decoration-none" 
                onClick={openForgotPassword}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-danger w-100 py-2 shadow">Login</button>

          <hr className="text-white my-3"/>

          <button type="button" className="btn btn-warning w-100 py-2 shadow" onClick={handleGoogleLogin}>
            <i className="bi bi-google"></i> Login with Google
          </button>
        </form>
         <p>Don't have an account? <a href="/register" className="text-decoration-none text-light">Register here</a></p> 

        <p className="mt-3">
          <a href="/" className="text-decoration-none text-light">⬅ Back to Intro</a>
        </p>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5 className="modal-title">Reset Password</h5>
              <button type="button" className="btn-close" onClick={closeForgotPassword}>×</button>
            </div>
            <div className="modal-body">
              {resetMessage.text && (
                <div className={`alert alert-${resetMessage.type} mb-3`}>
                  {resetMessage.text}
                </div>
              )}
              
              {renderForgotPasswordStep()}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Styles */}
      <style jsx="true">{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-container {
          background-color: #333;
          color: #fff;
          width: 400px;
          max-width: 90%;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #444;
        }
        
        .modal-title {
          margin: 0;
          font-weight: 600;
        }
        
        .modal-body {
          padding: 1rem;
        }
        
        .btn-close {
          background: transparent;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #fff;
        }
        
        .btn-close:hover {
          color: #ccc;
        }
      `}</style>
    </div>
  );
}
