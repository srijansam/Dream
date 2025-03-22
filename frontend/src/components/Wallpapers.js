import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import { Helmet } from "react-helmet-async"; // <-- SEO library import

export default function Wallpapers() {
    const [wallpapers, setWallpapers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        axios.get("https://hokagee.onrender.com/wallpapers")
            .then(res => setWallpapers(res.data))
            .catch(err => console.error("Failed to load wallpapers:", err));
    }, []);

    const backgroundStyle = {
        background: "linear-gradient(to bottom, #141a20, #0c1015)",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
    };

    const filteredWallpapers = wallpapers.filter(wp =>
        wp.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Navbar setSearchQuery={setSearchQuery} />
            <div style={backgroundStyle}>
              {/* 👇 SEO Helmet Meta Tags 👇 */}
              <Helmet>
              <title>Free Anime Wallpapers | Download HD Wallpapers | Hokage</title>
                <meta 
                    name="description" 
                    content="Download free HD anime wallpapers from Hokage. Personalize your device with your favourite anime scenes." 
                />
                <meta name="keywords" content="anime wallpaper, best anime wallpaper, free annime wallpaper, HD wallpaper, " />
                <link rel="canonical" href="https://hokagee.onrender.com/wallpapers" />
            </Helmet>
                <div className="container mt-4">
                    <h3 className="text-center mb-4">Wallpapers</h3>
                    <div className="row">
                        {filteredWallpapers.length > 0 ? (
                            filteredWallpapers.map((wp) => (
                                <div key={wp._id} className="col-md-4 mb-4">
                                    <div className="card wallpaper-card shadow-sm">
                                        <div
                                            className="wallpaper-img-container"
                                            onClick={() => window.open(wp.url, "_blank")}
                                        >
                                            <img
                                                src={wp.url}
                                                alt={wp.title}
                                                className="card-img-top"
                                            />
                                        </div>
                                        <div className="card-body d-flex justify-content-between align-items-center">
                                            <h5 className="card-title mb-0">{wp.title}</h5>
                                            <a
                                                href={wp.url}
                                                download
                                                className="icon-btn"
                                            >
                                                ⬇️
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center">No wallpapers found.</p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .wallpaper-card {
                    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: pointer;
                }

                .wallpaper-card:hover {
                    transform: scale(1.05);
                    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.2);
                }

                .wallpaper-img-container img {
                    height: 250px;
                    object-fit: cover;
                    transition: opacity 0.3s;
                    border-radius: 10px 10px 0 0;
                }

                .wallpaper-img-container img:hover {
                    opacity: 0.85;
                }

                .icon-btn {
                    font-size: 20px;
                    background: none;
                    border: none;
                    color: white;
                    transition: transform 0.2s ease-in-out;
                }

                .icon-btn:hover {
                    transform: scale(1.3);
                }
            `}</style>
        </>
    );
}
