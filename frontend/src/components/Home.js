import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { jwtDecode } from "jwt-decode";  

export default function Home() {
    const [animeList, setAnimeList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState(new Set());
    const [watchLater, setWatchLater] = useState(new Set());
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:5001/anime")
            .then(res => {
                setAnimeList(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load anime. Please try again later.");
                setLoading(false);
            });

        // Extract userId from JWT token
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.userId);

                // Fetch favorite animes
                axios.get("http://localhost:5001/favourite_anime", { 
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: { userId: decoded.userId } 
                })
                    .then(res => setFavorites(new Set(res.data.map(anime => anime._id))))
                    .catch(err => console.error("Error fetching favorites:", err));

                // Fetch watch later animes
                axios.get("http://localhost:5001/watch_later", { 
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: { userId: decoded.userId } 
                })
                    .then(res => setWatchLater(new Set(res.data.map(anime => anime._id))))
                    .catch(err => console.error("Error fetching watch later:", err));

            } catch (err) {
                console.error("Invalid token:", err);
                localStorage.removeItem("token");
            }
        }
    }, []);

    const toggleFavorite = async (anime) => {
        if (!userId) return alert("Please log in to save favorites.");

        const token = localStorage.getItem("token");
        if (!token) return alert("Please log in to save favorites.");

        const isFavorited = favorites.has(anime._id);
        const updatedFavorites = new Set(favorites);

        try {
            if (isFavorited) {
                await axios.delete(`http://localhost:5001/favourite_anime/${anime._id}`, { 
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    data: { userId } 
                });
                updatedFavorites.delete(anime._id);
            } else {
                await axios.post("http://localhost:5001/favourite_anime", 
                    { userId, animeId: anime._id, title: anime.title, description: anime.description, youtubeEmbedUrl: anime.youtubeEmbedUrl },
                    { 
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                updatedFavorites.add(anime._id);
            }
            setFavorites(new Set(updatedFavorites));
        } catch (err) {
            console.error("Error updating favorites:", err);
            alert("Failed to update favorites. Please try again later.");
        }
    };

    const toggleWatchLater = async (anime) => {
        if (!userId) return alert("Please log in to save Watch Later list.");

        const token = localStorage.getItem("token");
        if (!token) return alert("Please log in to save Watch Later list.");

        const isInWatchLater = watchLater.has(anime._id);
        const updatedWatchLater = new Set(watchLater);

        try {
            if (isInWatchLater) {
                await axios.delete(`http://localhost:5001/watch_later/${anime._id}`, { 
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    data: { userId } 
                });
                updatedWatchLater.delete(anime._id);
            } else {
                await axios.post("http://localhost:5001/watch_later", 
                    { userId, animeId: anime._id, title: anime.title, description: anime.description, youtubeEmbedUrl: anime.youtubeEmbedUrl },
                    { 
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                updatedWatchLater.add(anime._id);
            }
            setWatchLater(new Set(updatedWatchLater));
        } catch (err) {
            console.error("Error updating Watch Later:", err);
            alert("Failed to update Watch Later list. Please try again later.");
        }
    };

    const openFullscreen = (youtubeUrl) => {
        window.open(youtubeUrl, "_blank", "fullscreen=yes");
    };

    const backgroundStyle = {
        background: "linear-gradient(to bottom, #141a20, #0c1015)",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
    };

    const filteredAnime = animeList.filter(anime =>
        anime.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Navbar setSearchQuery={setSearchQuery} />
            <div style={backgroundStyle}>
                <div className="container mt-4">
                    {loading && <h3 className="text-center">Loading anime...</h3>}
                    {error && <h3 className="text-danger text-center">{error}</h3>}

                    <div className="row">
                        {filteredAnime.map((anime) => (
                            <div key={anime._id} className="col-md-4 mb-4">
                                <div className="anime-card card shadow-sm">
                                    <div 
                                        className="card-img-top" 
                                        onClick={() => openFullscreen(anime.youtubeEmbedUrl)}
                                    >
                                        <iframe
                                            width="100%"
                                            height="200"
                                            src={anime.youtubeEmbedUrl}
                                            title={anime.title}
                                            frameBorder="0"
                                            allow="fullscreen"
                                        ></iframe>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">{anime.description}</h5>
                                        <div className="button-group">
                                            <button 
                                                className="heart-btn"
                                                onClick={() => toggleFavorite(anime)}
                                            >
                                                {favorites.has(anime._id) ? "❤️" : "🤍"}
                                            </button>
                                            <button 
                                                className="watch-later-btn"
                                                onClick={() => toggleWatchLater(anime)}
                                            >
                                                {watchLater.has(anime._id) ? "⏳" : "🕒"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <style>
                     {`
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
                     `}
                </style>
                </div>
            </div>
        </>
    );
}
