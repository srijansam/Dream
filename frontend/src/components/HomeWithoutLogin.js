import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:5001/anime")
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
            {/* Updated Login Button with Link */}
            <Link to="/login" className="login-btn">Login</Link>

            <div className="container mt-4">
                <h1 className="mb-4 text-center">🎥 Hokage 🎥</h1>

                {loading && <h3 className="text-center">Loading anime...</h3>}
                {error && <h3 className="text-danger text-center">{error}</h3>}

                <div className="row">
                    {animeList.map((anime, index) => (
                        <div key={index} className="col-md-4 mb-4">
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
                                    <h5 className="card-title">{anime.title}</h5>
                                    <p className="card-text">{anime.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Beautiful CSS for Login Button */}
            <style>
                {`
                .login-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 12px 25px;
                    font-size: 16px;
                    font-weight: 600;
                    border-radius: 30px;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease-in-out;
                    box-shadow: 0px 4px 10px rgba(255, 255, 255, 0.2);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    text-decoration: none;
                    display: inline-block;
                }

                .login-btn:hover {
                    background: rgba(255, 255, 255, 0.25);
                    box-shadow: 0px 6px 15px rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                }

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
                `}
            </style>
        </div>
    );
}
