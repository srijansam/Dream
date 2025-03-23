import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Helmet } from "react-helmet";
 // <-- SEO library import
export default function About() {
  return (
    <div 
      className="d-flex justify-content-center align-items-center vh-100 text-white px-3" 
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('https://images3.alphacoders.com/132/1328396.png')",
        backgroundSize: "cover",
        backgroundPosition: "top center", // Aligns the image properly
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* 👇 SEO Helmet Meta Tags 👇 */}
                                                <Helmet>
                                                <title>Watch Free Underrated Anime and Download Free Wallpapers  | Hokage Anime Streaming  | Hokage</title>
                                                  <meta 
                                                      name="description" 
                                                      content="Stream hidden gem anime and underrated series for free on Hokage. Discover new anime and watch your favourites." 
                                                  />
                                                  <meta name="keywords" content="free anime streaming, hidden gem anime, underrated anime, hokage, youtube anime, top anime , fav anime, anime for free, wallaper, anime wallapper, hd wallpaer, best wallaper, best anime wallpaper " />
                                                  <link rel="canonical" href="https://hokagee.onrender.com//homeWithoutLogin" />
                                              </Helmet>
      <div className="container text-center p-5 bg-dark bg-opacity-75 rounded shadow-lg">
        <h1 className="mb-4 fw-bold display-5">🎥 Welcome to Hokage 🎥</h1>
        <p className="lead mb-4">
          Enjoy your favorite anime episodes with seamless streaming and high-quality video playback.
        </p>

        <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
          <a href="/homeWithoutLogin" className="btn btn-danger btn-lg px-4 py-2 shadow w-100 w-md-auto">
            Continue Without Logging In 🚀
          </a>
          <a href="/login" className="btn btn-danger btn-lg px-4 py-2 shadow w-100 w-md-auto">
            Login 🔐
          </a>
        </div>
      </div>
      <style>{`
        @media (max-width: 576px) {
          h1 {
            font-size: 1.8rem;
          }
          .lead {
            font-size: 1rem;
          }
          .btn {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}
