import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function About() {
  return (
    <div 
      className="d-flex justify-content-center align-items-center vh-100 text-white" 
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('https://images3.alphacoders.com/132/1328396.png')",
        backgroundSize: "cover",
        backgroundPosition: "top center", // Aligns the image properly
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="container text-center p-5 bg-dark bg-opacity-75 rounded shadow-lg">
        <h1 className="mb-4 fw-bold">🎥 Welcome to Hokage 🎥</h1>
        <p className="lead">
          Enjoy your favorite anime episodes with seamless streaming and high-quality video playback.
        </p>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <a href="/homeWithoutLogin" className="btn btn-lg btn-danger px-4 py-2 shadow">
            Continue Without Logging In 🚀
          </a>
          <a href="/login" className="btn btn-lg btn-danger px-4 py-2 shadow">
            Login 🔐
          </a>
        </div>
      </div>
    </div>
  );
}
