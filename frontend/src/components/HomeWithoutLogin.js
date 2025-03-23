import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link
import { Helmet } from "react-helmet";
 // <-- SEO library import
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default function Home() {
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    //const [selectedVideo, setSelectedVideo] = useState(null);
    const [showNotification, setShowNotification] = useState(true);
    useEffect(() => {
        axios.get("https://hokagee.onrender.com/anime")
            .then(res => {
                console.log("Fetched Anime Data:", res.data);
                setAnimeList(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching anime:", err);
                setError("Failed to load anime. Please try again later.");
                setLoading(false);
            });
    }, []);

    const openFullscreen = (youtubeUrl) => {
        window.open(youtubeUrl, "_blank", "fullscreen=yes");
    };

    const backgroundStyle = {
        background: "linear-gradient(to bottom, #141a20, #0c1015)", 
        minHeight: "100vh",
        color: "white",
        padding: "20px",
        position: "relative",
    };

    return (
        <div style={backgroundStyle}>
              {/* 👇 SEO Helmet Meta Tags 👇 */}
                                          <Helmet>
                                          <title>Watch Free Underrated Anime | Hokage Anime Streaming  | Hokage</title>
                                            <meta 
                                                name="description" 
                                                content="Stream hidden gem anime and underrated series for free on Hokage. Discover new anime and watch your favourites." 
                                            />
                                            <meta name="keywords" content="free anime streaming, hidden gem anime, underrated anime, hokage, youtube anime, top anime , fav anime, anime for free " />
                                            <link rel="canonical" href="https://hokagee.onrender.com//homeWithoutLogin" />
                                        </Helmet>
              {/* Notification Bar */}
              {showNotification && (
                <div className="notification-bar d-flex justify-content-between align-items-center px-4">
                    <p>
                        🚀 Login to get amazing HD wallpapers, save your favorites online, unlock exclusive content & much more! ✨
                    </p>
                    <button className="btn-close btn-close-white" onClick={() => setShowNotification(false)}></button>
                </div>
            )}                            
            {/* Updated Login Button with Link */}
            <Link to="/login" className="login-btn">Login</Link>

            <div className="container mt-4">
                <h1 className="mb-4 text-center">🎥 Hokage 🎥</h1>

                {loading && <h3 className="text-center">Loading anime...</h3>}
                {error && <h3 className="text-danger text-center">{error}</h3>}

                <div className="row">
                    {animeList.map((anime, index) => (
                        <div key={index} className="col-12 col-sm-6 col-md-4 mb-4 d-flex">
                            <div className="anime-card card shadow-sm flex-fill">
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
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{anime.title}</h5>
                                    <p className="card-text">{anime.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Beautiful CSS for Login Button */}
            <style>{`
                .notification-bar {
                    position: fixed;
                    top: 0;
                    width: 100%;
                    background: linear-gradient(90deg, #e53935, #d81b60, #8e24aa);
                    color: white;
                    height: 60px;
                    z-index: 999;
                    overflow: hidden;
                }
                .notification-bar p {
                    display: inline-block;
                    white-space: nowrap;
                    animation: scrollText 15s linear infinite;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    margin: 0;
                }
                @keyframes scrollText {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }

                .login-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 10px 20px;
                    font-size: 14px;
                    font-weight: 600;
                    border-radius: 30px;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease-in-out;
                    box-shadow: 0px 4px 10px rgba(255, 255, 255, 0.2);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    text-decoration: none;
                    z-index: 1000;
                }

                .login-btn:hover {
                    background: rgba(255, 255, 255, 0.25);
                    box-shadow: 0px 6px 15px rgba(255, 255, 255, 0.3);
                    transform: scale(1.05);
                }

                .anime-card {
                    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .anime-card:hover {
                    transform: scale(1.03);
                    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
                }

                .anime-card .card-img-top {
                    border-radius: 10px 10px 0 0;
                }

                @media (max-width: 576px) {
                    .login-btn {
                        padding: 8px 16px;
                        font-size: 12px;
                    }
                    .card-body h5 {
                        font-size: 1rem;
                    }
                    .card-body p {
                        font-size: 0.9rem;
                    }
                    .notification-bar {
                        flex-direction: column;
                        height: auto;
                        padding: 5px;
                    }
                }
            `}</style>
        </div>
    );
}
