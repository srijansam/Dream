import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { jwtDecode } from "jwt-decode";

export default function FavouriteAnime() {
    const [favouriteAnime, setFavouriteAnime] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState(new Set());

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                axios.get("http://localhost:5001/favourite_anime", {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { userId: decoded.userId },
                })
                .then(res => {
                    setFavouriteAnime(res.data);
                    setFavorites(new Set(res.data.map(anime => anime._id)));
                    setLoading(false);
                })
                .catch(err => {
                    setError("Failed to load favourite anime. Please try again later.");
                    setLoading(false);
                });
            } catch (err) {
                console.error("Invalid token:", err);
                localStorage.removeItem("token");
            }
        } else {
            setError("Please log in to view your favourite anime.");
            setLoading(false);
        }
    }, []);

    const toggleFavorite = async (anime) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        try {
            const decoded = jwtDecode(token);
            if (favorites.has(anime._id)) {
                await axios.delete(`http://localhost:5001/favourite_anime/${anime._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { userId: decoded.userId }
                });
                setFavorites(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(anime._id);
                    return newSet;
                });
                setFavouriteAnime(prev => prev.filter(item => item._id !== anime._id));
            }
        } catch (err) {
            console.error("Error removing anime from favourites:", err);
        }
    };

    return (
        <>
            <Navbar />
            <div style={{ background: "linear-gradient(to bottom, #1a1f25, #0c1015)", minHeight: "100vh", color: "white", padding: "20px" }}>
                <div className="container mt-4">
                    <h2 className="text-center mb-4">❤️ Favourite Anime</h2>

                    {loading && <h3 className="text-center">Loading favourite anime...</h3>}
                    {error && <h3 className="text-danger text-center">{error}</h3>}

                    <div className="row">
                        {favouriteAnime.length === 0 && !loading && (
                            <h4 className="text-center text-secondary">No favourite anime added yet.</h4>
                        )}
                        
                        {favouriteAnime.map((anime) => (
                            <div key={anime._id} className="col-md-4 mb-4">
                                <div className="anime-card card shadow-sm position-relative">
                                    <div className="card-img-top" onClick={() => window.open(anime.youtubeEmbedUrl, "_blank", "fullscreen=yes")}> 
                                        <iframe width="100%" height="200" src={anime.youtubeEmbedUrl} title={anime.title} frameBorder="0" allow="fullscreen"></iframe>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">{anime.title}</h5>
                                        <p className="card-text">{anime.description}</p>
                                        <button 
                                            className="heart-btn"
                                            onClick={() => toggleFavorite(anime)}
                                        >
                                            {favorites.has(anime._id) ? "🗑️" : "🗑️"}
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
