import React from "react";
import Navbar from "./Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ComingSoon() {
    return (
        <>
            <Navbar />
            <div style={{ background: "linear-gradient(to bottom, #1a1f25, #0c1015)", minHeight: "100vh", color: "white", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
                <div className="container text-center">
                    <h1 style={{ fontSize: "4rem", fontWeight: "bold", letterSpacing: "2px" }}>🚧 Coming Soon 🚧</h1>
                    <p style={{ fontSize: "1.2rem", color: "lightgray" }}>We're working hard to bring this feature to you!</p>
                </div>

                <style>{`
                    h1 {
                        text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
                    }
                    p {
                        margin-top: 15px;
                        text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
                    }
                `}</style>
            </div>
        </>
    );
}
