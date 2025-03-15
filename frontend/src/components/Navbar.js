import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = ({ setSearchQuery }) => {
    const [user, setUser] = useState(null);
    const [localSearch, setLocalSearch] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios.get("http://localhost:5001/user", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true
        })
        .then(response => {
            setUser(response.data);
        })
        .catch(error => {
            console.error("Error fetching user data:", error.message);
        });
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchQuery && setSearchQuery(localSearch);  // Send search input to Home.js
    };

    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid">
                <Sidebar />
                <img src="/assets/kakashi_icon.png" alt="Kakashi Icon" style={{ width: "100px", height: "60px" }} />
                <a className="navbar-brand fw-bold" href="#">HOKAGE</a>

                <div className="collapse navbar-collapse justify-content-center">
                    {setSearchQuery && (
                        <form className="d-flex" role="search" style={{ width: "50%" }} onSubmit={handleSearch}>
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
                </div>

                <div className="d-flex align-items-center">
                    <ThemeToggle />
                    <span className="navbar-text fw-bold ms-3 me-3">
                        {user ? user.name : "Guest"}
                    </span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
