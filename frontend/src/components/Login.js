import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
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
    setLoginError("");
    setIsLoading(true);

    try {
      const response = await api.post("/login", { email, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/home");
      } else {
        setLoginError("Login failed");
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
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
      const response = await api.withLoading.post("/forgot-password", { 
        email: forgotPasswordEmail 
      }, { loading: setIsLoading });
      setResetMessage({ text: "Verification code sent to your email", type: "success" });
      setResetStep(2);
    } catch (error) {
      setResetMessage({ 
        text: error.response?.data?.message || "Failed to send verification code", 
        type: "danger" 
      });
    }
  };
  
  // Verify code and proceed to password reset
  const verifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setResetMessage({ text: "Please enter the verification code", type: "danger" });
      return;
    }
    
    try {
      const response = await api.withLoading.post("/verify-reset-code", {
        email: forgotPasswordEmail,
        code: verificationCode
      }, { loading: setIsLoading });
      setResetMessage({ text: "Code verified successfully", type: "success" });
      setResetStep(3);
    } catch (error) {
      setResetMessage({ 
        text: error.response?.data?.message || "Invalid verification code", 
        type: "danger" 
      });
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
    
    try {
      const response = await api.withLoading.post("/reset-password", {
        email: forgotPasswordEmail,
        code: verificationCode,
        newPassword: newPassword
      }, { loading: setIsLoading });
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
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">Login</h2>
              {loginError && (
                <div className="alert alert-danger" role="alert">
                  {loginError}
                </div>
              )}
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : "Login"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <i className="fab fa-google me-2"></i>
                    Login with Google
                  </button>
                </div>
              </form>
              <div className="text-center mt-3">
                <button
                  className="btn btn-link"
                  onClick={openForgotPassword}
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reset Password</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeForgotPassword}
                  disabled={isLoading}
                ></button>
              </div>
              <div className="modal-body">
                {resetMessage.text && (
                  <div className={`alert alert-${resetMessage.type}`} role="alert">
                    {resetMessage.text}
                  </div>
                )}
                {resetStep === 1 && (
                  <form onSubmit={requestVerificationCode}>
                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
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
                            Sending...
                          </>
                        ) : "Send Verification Code"}
                      </button>
                    </div>
                  </form>
                )}
                {resetStep === 2 && (
                  <form onSubmit={verifyCode}>
                    <div className="mb-3">
                      <label className="form-label">Verification Code</label>
                      <input
                        type="text"
                        className="form-control"
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
                )}
                {resetStep === 3 && (
                  <form onSubmit={resetPassword}>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength="6"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
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
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
