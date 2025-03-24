import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import Login from "./components/Login";
import Register from "./components/Register";
import HomeWithoutLogin from "./components/HomeWithoutLogin";
import FavouriteAnime from "./components/FavouriteAnime";
import WatchLater from "./components/WatchLater";
import GoogleCallback from "./components/GoogleCallback";
import Settings from "./components/Settings";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/theme.css";
import Wallpapers from "./components/Wallpapers";
import Store from "./components/Store";

const App = () => {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/homeWithoutLogin" element={<HomeWithoutLogin />} />
                    <Route path="/google/callback" element={<GoogleCallback />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/favourite-anime" element={<FavouriteAnime />} />
                    <Route path="/watch-later" element={<WatchLater />} />
                    <Route path="/anime-wallpapers" element={<Wallpapers />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
