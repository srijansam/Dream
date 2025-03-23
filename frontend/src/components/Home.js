import React, { useEffect, useState } from "react";
import api from "../utils/api";
import Navbar from "./Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { Helmet } from "react-helmet";
 // <-- SEO library import
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
        api.get("https://hokagee.onrender.com/anime")
            .then(res => {
                setAnimeList(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading anime:", err);
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
                api.get("/favourite_anime", { 
                    params: { userId: decoded.userId } 
                })
                    .then(res => setFavorites(new Set(res.data.map(anime => anime._id))))
                    .catch(err => console.error("Error fetching favorites:", err));

                // Fetch watch later animes
                api.get("/watch_later", { 
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
                await api.delete(`/favourite_anime/${anime._id}`, { 
                    data: { userId } 
                });
                updatedFavorites.delete(anime._id);
            } else {
                await api.post("/favourite_anime", { 
                    userId, 
                    animeId: anime._id, 
                    title: anime.title, 
                    description: anime.description, 
                    youtubeEmbedUrl: anime.youtubeEmbedUrl 
                });
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
                await api.delete(`/watch_later/${anime._id}`, { 
                    data: { userId } 
                });
                updatedWatchLater.delete(anime._id);
            } else {
                await api.post("/watch_later", { 
                    userId, 
                    animeId: anime._id, 
                    title: anime.title, 
                    description: anime.description, 
                    youtubeEmbedUrl: anime.youtubeEmbedUrl 
                });
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
                 {/* 👇 SEO Helmet Meta Tags 👇 */}
                              <Helmet>
                              <title>Watch Free Underrated Anime | Hokage Anime Streaming  | Hokage</title>
                                <meta 
                                    name="description" 
                                    content="Stream hidden gem anime and underrated series for free on Hokage. Discover new anime and watch your favourites." 
                                />
                                <meta name="keywords" content="free anime streaming, hidden gem anime, underrated anime, hokage, youtube anime, top anime , fav anime, anime for free " />
                                <link rel="canonical" href="https://hokagee.onrender.com/" />
                            </Helmet>
                <div className="container mt-4">
                    {loading && <h3 className="text-center">Loading anime...</h3>}
                    {error && <h3 className="text-danger text-center">{error}</h3>}

                    <div className="row">
    {filteredAnime.map((anime) => (
        <div key={anime._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
            <div className="anime-card card shadow-sm h-100 d-flex flex-column">
                <div 
                    className="card-img-top embed-responsive embed-responsive-16by9" 
                    onClick={() => openFullscreen(anime.youtubeEmbedUrl)}
                >
                    <iframe
                        className="embed-responsive-item"
                        src={anime.youtubeEmbedUrl}
                        title={anime.title}
                        allow="fullscreen"
                    ></iframe>
                </div>
                <div className="card-body d-flex flex-column justify-content-between">
                    <h6 className="card-title text-truncate">{anime.description}</h6>
                    <div className="button-group mt-2">
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
    background: #1c1f25;
    color: white;
}

.anime-card:hover {
    transform: scale(1.03);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
}

.embed-responsive {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    overflow: hidden;
    padding-bottom: 56.25%;
}

.embed-responsive iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.card-title {
    font-size: 0.95rem;
}

.button-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.heart-btn, .watch-later-btn {
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
}

.heart-btn:hover, .watch-later-btn:hover {
    transform: scale(1.2);
}

/* Additional tweak for smaller screens */
@media (max-width: 576px) {
    .card-title {
        font-size: 0.85rem;
    }

    .heart-btn, .watch-later-btn {
        font-size: 20px;
    }
}
`}
</style>
                </div>
            </div>
        </>
    );
}
