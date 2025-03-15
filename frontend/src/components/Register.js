import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/register", { name, email, password });
      alert("Registration Successful! Please login.");
      navigate("/login"); // Redirect to login page
    } catch (err) {
      setError(err.response?.data?.message || "Error registering user");
    }
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center vh-100 text-white" 
      style={{
        background: "linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('https://images3.alphacoders.com/144/144565.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="container text-center p-5 bg-dark bg-opacity-75 rounded shadow-lg" style={{ maxWidth: "400px" }}>
        <h3 className="mb-4 fw-bold">📝 Sign UP</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="mb-3 text-start">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" placeholder="Enter your name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-danger w-100 py-2 shadow">Register</button>
        </form>

        <p className="mt-3">
          Already have an account? <a href="/login" className="text-decoration-none text-light">Login here</a>
        </p>
      </div>
    </div>
  );
}
