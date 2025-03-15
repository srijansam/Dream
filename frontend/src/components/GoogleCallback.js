import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (token) {
            // Store the token in localStorage
            localStorage.setItem('token', token);
            console.log('Google authentication successful, token stored');
            
            // Redirect to home page
            navigate('/home');
        } else {
            console.error('No token received from Google authentication');
            navigate('/login');
        }
    }, [location, navigate]);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <h2>Authenticating with Google...</h2>
                <div className="spinner-border mt-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );
};

export default GoogleCallback; 