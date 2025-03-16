import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extract token from URL query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (token) {
            console.log('Token received from Google OAuth callback');
            // Store the token in localStorage
            localStorage.setItem('token', token);
            // Redirect to home page
            navigate('/home');
        } else {
            console.error('No token received from Google OAuth callback');
            // Handle error - redirect to login page with error message
            navigate('/?error=no_token');
        }
    }, [navigate, location]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Completing authentication, please wait...</p>
            </div>
        </div>
    );
};

export default GoogleCallback; 