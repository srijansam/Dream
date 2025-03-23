import React, { useEffect, useState } from "react";
import api from "../utils/api";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = ({ setSearchQuery }) => {
    const [user, setUser] = useState(null);
    const [localSearch, setLocalSearch] = useState("");
    const [isCollapsed, setIsCollapsed] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            return;
        }

        api.get("/user")
            .then(response => {
                setUser(response.data);
            })
            .catch(error => {
                console.error("Error fetching user data:", error.message);
                setUser(null);
                // If we get a 401/403 error, the token is invalid/expired
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem("token");
                }
            });
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchQuery && setSearchQuery(localSearch);  // Send search input to Home.js
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3">
            <div className="container-fluid d-flex align-items-center flex-wrap">
                {/* Sidebar & Logo */}
                <div className="d-flex align-items-center me-auto">
                    <Sidebar />
                    <img src="/assets/kakashi_icon.png" alt="Kakashi Icon" style={{ width: "80px", height: "50px" }} />
                    <a className="navbar-brand fw-bold ms-2" href="#">HOKAGE</a>
                </div>

                {/* Toggler for small screens */}
                <button
                    className="navbar-toggler ms-2"
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Collapsible area */}
                <div className={`collapse navbar-collapse ${isCollapsed ? "show" : ""}`}>
                    {/* Search Bar */}
                    {setSearchQuery && (
                        <form className="d-flex mx-auto my-3 my-lg-0" role="search" style={{ width: "60%" }} onSubmit={handleSearch}>
                            <input
                                className="form-control me-2"
                                type="search"
                                placeholder="Search Anime"
                                aria-label="Search"
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                            />
                            <button className="btn btn-outline-light" type="submit">Search</button>
                        </form>
                    )}

                    {/* Theme Toggle & User */}
                    <div className="d-flex align-items-center justify-content-center mt-3 mt-lg-0 ms-lg-3">
                        <ThemeToggle />
                        <span className="navbar-text fw-bold ms-3">
                            {user ? user.name : "Guest"}
                        </span>
                    </div>
                </div>
            </div>
            {/* Custom styles */}
            <style jsx>{`
                .navbar-brand {
                    font-size: 1.4rem;
                }

                @media (max-width: 768px) {
                    .navbar-brand {
                        font-size: 1.2rem;
                    }

                    form {
                        width: 100% !important;
                    }

                    .navbar-text {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
