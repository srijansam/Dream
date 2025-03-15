import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { jwtDecode } from "jwt-decode"; // Ensure correct import

export default function WatchLater() {
    const [watchLaterAnime, setWatchLaterAnime] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [watchlater, setWatchLater] = useState(new Set());

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("Fetching watch later anime for user:", decoded.userId);

                axios.get("http://localhost:5001/watch_later", {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { userId: decoded.userId }
                })
                .then(res => {
                    console.log("Fetched Watch Later Data:", res.data);
                    setWatchLaterAnime(res.data);
                    setWatchLater(new Set(res.data.map(anime => anime._id))); // Initialize watchlater set
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching watch later anime:", err.response);
                    setError("Failed to load watch later anime. Please try again later.");
                    setLoading(false);
                });
            } catch (err) {
                console.error("Invalid token:", err);
                localStorage.removeItem("token");
            }
        } else {
            setError("Please log in to view your watch later list.");
            setLoading(false);
        }
    }, []);

    const openFullscreen = (youtubeUrl) => {
        window.open(youtubeUrl, "_blank", "fullscreen=yes");
    };

    const toggleWatchLater = async (anime) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            await axios.delete(`http://localhost:5001/watch_later/${anime._id}`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { userId: decoded.userId }
            });

            setWatchLater(prev => {
                const newSet = new Set(prev);
                newSet.delete(anime._id);
                return newSet;
            });

            setWatchLaterAnime(prev => prev.filter(item => item._id !== anime._id));
        } catch (err) {
            console.error("Error removing anime from watchlist:", err);
        }
    };

    return (
        <>
            <Navbar />
            <div style={{ background: "linear-gradient(to bottom, #1a1f25, #0c1015)", minHeight: "100vh", color: "white", padding: "20px" }}>
                <div className="container mt-4">
                    <h2 className="text-center mb-4">⏳ Watch Later</h2>

                    {loading && <h3 className="text-center">Loading watch later anime...</h3>}
                    {error && <h3 className="text-danger text-center">{error}</h3>}

                    <div className="row">
                        {watchLaterAnime.length === 0 && !loading && (
                            <h4 className="text-center text-secondary">No anime added to watch later.</h4>
                        )}

                        {watchLaterAnime.map((anime) => (
                            <div key={anime._id} className="col-md-4 mb-4">
                                <div className="anime-card card shadow-sm">
                                    <div className="card-img-top" onClick={() => openFullscreen(anime.youtubeEmbedUrl)}>
                                        <iframe width="100%" height="200" src={anime.youtubeEmbedUrl} title={anime.title} frameBorder="0" allow="fullscreen"></iframe>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">{anime.title}</h5>
                                        <p className="card-text">{anime.description}</p>
                                        <button 
                                            className="watch-later-btn"
                                            onClick={() => toggleWatchLater(anime)}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <style>{`
                        .anime-card {
                            transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
                            border-radius: 10px;
                            overflow: hidden;
                        }
                        .anime-card:hover {
                            transform: scale(1.05);
                            box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
                        }
                        .anime-card .card-img-top {
                            border-radius: 10px 10px 0 0;
                        }
                         .button-group {
                        display: flex;
                        justify-content: space-between;
                        padding-top: 10px;
                    }

                    .heart-btn, .watch-later-btn {
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                        transition: transform 0.2s ease-in-out;
                    }

                    .heart-btn:hover, .watch-later-btn:hover {
                        transform: scale(1.2);
                    }
                    `}</style>
                </div>
            </div>
        </>
    );
}
