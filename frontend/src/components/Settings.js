import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { ThemeContext } from "../contexts/ThemeContext";

const Settings = () => {
    const { isDarkMode, toggleTheme } = useContext(ThemeContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        autoplay: true,
        notifications: true,
        subtitles: "English",
        quality: "Auto"
    });
    const [saved, setSaved] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isGoogleUser, setIsGoogleUser] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({ userId: decoded.userId });
                
                // Fetch user details to check if they're a Google user
                axios.get("http://localhost:5001/user", {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                })
                .then(response => {
                    // If user has googleId, they're a Google user
                    setIsGoogleUser(!!response.data.googleId);
                    setUser(response.data);
                })
                .catch(error => {
                    console.error("Error fetching user details:", error);
                });
                
                // In a real app, you would fetch user settings from the backend
                // For now, we'll just use the default settings
                setLoading(false);
            } catch (err) {
                console.error("Invalid token:", err);
                localStorage.removeItem("token");
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setSaved(false);
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear any previous error/success messages when user types
        setPasswordError("");
        setPasswordSuccess("");
    };

    const handleThemeToggle = () => {
        toggleTheme();
        setSaved(false);
    };

    const saveSettings = () => {
        // In a real app, you would save the settings to the backend
        // For now, we'll just simulate a save
        setTimeout(() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 500);
    };

    const changePassword = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!passwordData.currentPassword) {
            setPasswordError("Current password is required");
            return;
        }
        
        if (!passwordData.newPassword) {
            setPasswordError("New password is required");
            return;
        }
        
        if (passwordData.newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords don't match");
            return;
        }
        
        const token = localStorage.getItem("token");
        if (!token) {
            setPasswordError("You must be logged in to change your password");
            return;
        }
        
        // Send password change request to backend
        axios.post("http://localhost:5001/change-password", 
            {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        )
        .then(response => {
            setPasswordSuccess("Password changed successfully!");
            // Clear password fields
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        })
        .catch(error => {
            if (error.response && error.response.data && error.response.data.message) {
                setPasswordError(error.response.data.message);
            } else {
                setPasswordError("Failed to change password. Please try again.");
            }
        });
    };

    return (
        <>
            <Navbar />
            <div className="container mt-4 py-4">
                <h2 className="text-center mb-4">⚙️ Settings</h2>
                
                {loading ? (
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : !user ? (
                    <div className="alert alert-warning">
                        Please log in to access your settings.
                    </div>
                ) : (
                    <div className="row">
                        <div className="col-md-8 mx-auto">
                            {/* Account Settings Card */}
                            <div className="card shadow mb-4">
                                <div className="card-body">
                                    <h5 className="card-title mb-3">Account Settings</h5>
                                    <div className="mb-3">
                                        <label className="form-label">Email</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            value={user.email || ""}
                                            disabled
                                        />
                                        <small className="form-text text-muted">
                                            {isGoogleUser ? 
                                                "You're signed in with Google. Manage your account through Google." : 
                                                "You're signed in with email and password."}
                                        </small>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Password Change Card - Only for email/password users */}
                            {!isGoogleUser && (
                                <div className="card shadow mb-4">
                                    <div className="card-body">
                                        <h5 className="card-title mb-4">Change Password</h5>
                                        <form onSubmit={changePassword}>
                                            <div className="mb-3">
                                                <label htmlFor="currentPassword" className="form-label">Current Password</label>
                                                <input 
                                                    type="password" 
                                                    className="form-control" 
                                                    id="currentPassword" 
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    autoComplete="current-password"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="newPassword" className="form-label">New Password</label>
                                                <input 
                                                    type="password" 
                                                    className="form-control" 
                                                    id="newPassword" 
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    autoComplete="new-password"
                                                    minLength="6"
                                                />
                                                <small className="form-text text-muted">
                                                    Password must be at least 6 characters long.
                                                </small>
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                                                <input 
                                                    type="password" 
                                                    className="form-control" 
                                                    id="confirmPassword" 
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    autoComplete="new-password"
                                                />
                                            </div>
                                            
                                            {passwordError && (
                                                <div className="alert alert-danger">{passwordError}</div>
                                            )}
                                            
                                            {passwordSuccess && (
                                                <div className="alert alert-success">{passwordSuccess}</div>
                                            )}
                                            
                                            <div className="d-grid">
                                                <button type="submit" className="btn btn-primary">
                                                    Change Password
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                            
                            {/* Appearance Card */}
                            <div className="card shadow mb-4">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">Appearance</h5>
                                    <div className="form-check form-switch mb-3">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id="darkMode" 
                                            checked={isDarkMode}
                                            onChange={handleThemeToggle}
                                        />
                                        <label className="form-check-label" htmlFor="darkMode">
                                            Dark Mode
                                        </label>
                                        <small className="form-text text-muted d-block mt-1">
                                            Changes the theme of the content area. Navbar and sidebar will remain unchanged.
                                        </small>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Playback Settings Card */}
                            <div className="card shadow mb-4">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">Playback</h5>
                                    <div className="form-check form-switch mb-3">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id="autoplay" 
                                            name="autoplay"
                                            checked={settings.autoplay}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="autoplay">
                                            Autoplay Videos
                                        </label>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label htmlFor="quality" className="form-label">Default Video Quality</label>
                                        <select 
                                            className="form-select" 
                                            id="quality" 
                                            name="quality"
                                            value={settings.quality}
                                            onChange={handleChange}
                                        >
                                            <option value="Auto">Auto</option>
                                            <option value="1080p">1080p</option>
                                            <option value="720p">720p</option>
                                            <option value="480p">480p</option>
                                            <option value="360p">360p</option>
                                        </select>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label htmlFor="subtitles" className="form-label">Default Subtitles</label>
                                        <select 
                                            className="form-select" 
                                            id="subtitles" 
                                            name="subtitles"
                                            value={settings.subtitles}
                                            onChange={handleChange}
                                        >
                                            <option value="English">English</option>
                                            <option value="Japanese">Japanese</option>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Notifications Card */}
                            <div className="card shadow mb-4">
                                <div className="card-body">
                                    <h5 className="card-title mb-4">Notifications</h5>
                                    <div className="form-check form-switch mb-3">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            id="notifications" 
                                            name="notifications"
                                            checked={settings.notifications}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="notifications">
                                            Enable Notifications
                                        </label>
                                    </div>
                                    
                                    <div className="d-grid gap-2 mt-4">
                                        <button 
                                            className="btn btn-primary" 
                                            onClick={saveSettings}
                                        >
                                            Save Settings
                                        </button>
                                        {saved && (
                                            <div className="alert alert-success mt-3">
                                                Settings saved successfully!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Settings; 