import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FavouriteAnime from "./FavouriteAnime";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); 

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        try {
            await axios.get("http://localhost:5001/logout", { withCredentials: true });
            localStorage.removeItem("token"); // Remove JWT token
            setUser(null); // Reset user state
            navigate("/homewithoutlogin"); // Redirect after logout
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };
    
    

    
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5001/user", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    withCredentials: true // Ensure session cookies are sent
                });
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUser(null); // Reset user if error occurs
            }
        };
    
        fetchUser();
    }, []);
    

    return (
        <>
            {/* Sidebar Toggle Button */}
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                ☰
            </button>

            {/* Sidebar Overlay */}
            <div className={`sidebar-overlay ${isOpen ? "show" : ""}`} onClick={toggleSidebar}></div>

            {/* Sidebar Content */}
            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <button className="close-btn" onClick={toggleSidebar}>×</button>
                <ul className="list-unstyled mt-4">
                    <li className="mb-3"><Link to="/home" className="sidebar-link">🏠 Dashboard</Link></li>
                    <li className="mb-3"><a href="#" className="sidebar-link">👤 Profile</a></li>
                    <li className="mb-3"><Link to="/favourite-anime" className="sidebar-link">❤️ Favorites</Link></li>
                    <li className="mb-3"><Link to="/watch-later" className="sidebar-link">⏳ Watch Later</Link></li>
                    <li className="mb-3"><Link to="/settings" className="sidebar-link">⚙ Settings</Link></li>
                    {user && (
                        <li className="mb-3">
                            <a href="#" className="sidebar-link" onClick={handleLogout}>🚪 Logout</a>
                        </li>
                    )}
                </ul>
            </div>

            {/* Sidebar CSS */}
            <style>
                {`
                    /* Sidebar Toggle Button */
                    .sidebar-toggle-btn {
                    background: #333;
    color: white;
    font-size: 18px; /* Reduced size */
    border: none;
    padding: 6px 10px; /* Adjusted padding */
    cursor: pointer;
    border-radius: 5px;
    transition: background 0.3s;
}

                    .sidebar-toggle-btn:hover {
                        background: #555;
                    }

                    /* Sidebar Overlay */
                    .sidebar-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.6);
                        z-index: 1049;
                        display: none;
                        transition: opacity 0.3s ease;
                    }
                    .sidebar-overlay.show {
                        display: block;
                    }

                    /* Sidebar */
                    .sidebar {
                        position: fixed;
                        top: 0;
                        left: -270px;
                        width: 270px;
                        height: 100vh;
                        background: rgba(34, 34, 34, 0.9);
                        color: white;
                        padding: 20px;
                        transition: left 0.3s ease;
                        z-index: 1050;
                        backdrop-filter: blur(5px);
                        box-shadow: 5px 0 10px rgba(0, 0, 0, 0.3);
                    }
                    .sidebar.open {
                        left: 0;
                    }

                    /* Close Button */
                    .close-btn {
                        position: absolute;
                        top: 10px;
                        right: 15px;
                        background: none;
                        border: none;
                        color: white;
                        font-size: 26px;
                        cursor: pointer;
                        transition: color 0.3s;
                    }
                    .close-btn:hover {
                        color: red;
                    }

                    /* Sidebar Links */
                    .sidebar-link {
                        display: block;
                        padding: 10px;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        transition: background 0.3s, transform 0.2s;
                    }
                    .sidebar-link:hover {
                        background: rgba(255, 255, 255, 0.2);
                        transform: translateX(5px);
                    }
                `}
            </style>
        </>
    );
};

export default Sidebar;
