import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Login from "./components/Login";
import Register from "./components/Register";
import HomeWithoutLogin from "./components/HomeWithoutLogin";
import FavouriteAnime from "./components/FavouriteAnime";
import WatchLater from "./components/WatchLater";
import GoogleCallback from "./components/GoogleCallback";
import Settings from "./components/Settings";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/theme.css";

// Protected Route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

const App = () => {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<About />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/homeWithoutLogin" element={<HomeWithoutLogin />} />
                            <Route path="/auth/google/callback" element={<GoogleCallback />} />
                            
                            {/* Protected Routes */}
                            <Route 
                                path="/home" 
                                element={
                                    <ProtectedRoute>
                                        <Home />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/favourite-anime" 
                                element={
                                    <ProtectedRoute>
                                        <FavouriteAnime />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/watch-later" 
                                element={
                                    <ProtectedRoute>
                                        <WatchLater />
                                    </ProtectedRoute>
                                } 
                            />
                            <Route 
                                path="/settings" 
                                element={
                                    <ProtectedRoute>
                                        <Settings />
                                    </ProtectedRoute>
                                } 
                            />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
};

export default App;
