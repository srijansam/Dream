const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Anime = require("../models/Anime");
const FavouriteAnime = require("../models/FavouriteAnime");
const WatchLater = require("../models/WatchLater");
const { fetchAndStoreAnime } = require("../services/youtube");

// Get all anime
router.get("/", async (req, res) => {
    try {
        const anime = await Anime.find();
        res.json(anime);
    } catch (err) {
        res.status(500).json({ message: "Error fetching anime", error: err });
    }
});

// Manual refresh endpoint for anime data
router.post("/refresh", authenticateToken, async (req, res) => {
    try {
        const result = await fetchAndStoreAnime();
        res.json({ message: "Anime data refreshed successfully", result });
    } catch (err) {
        res.status(500).json({ message: "Error refreshing anime data", error: err.message });
    }
});

// Get favorite anime for user
router.get("/favorites", authenticateToken, async (req, res) => {
    try {
        const favorites = await FavouriteAnime.find({ userId: req.user.userId });
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ message: "Error fetching favorites", error: err });
    }
});

// Add anime to favorites
router.post("/favorites", authenticateToken, async (req, res) => {
    try {
        const { animeId, title, description, youtubeEmbedUrl, thumbnailUrl } = req.body;
        
        // Check if already in favorites
        const existing = await FavouriteAnime.findOne({ 
            userId: req.user.userId, 
            animeId 
        });
        
        if (existing) {
            return res.status(400).json({ message: "Anime already in favorites" });
        }
        
        const favorite = new FavouriteAnime({
            userId: req.user.userId,
            animeId,
            title,
            description,
            youtubeEmbedUrl,
            thumbnailUrl
        });
        
        await favorite.save();
        res.json({ message: "Added to favorites", favorite });
    } catch (err) {
        res.status(500).json({ message: "Error adding to favorites", error: err });
    }
});

// Remove anime from favorites
router.delete("/favorites/:animeId", authenticateToken, async (req, res) => {
    try {
        await FavouriteAnime.findOneAndDelete({ 
            userId: req.user.userId, 
            animeId: req.params.animeId 
        });
        res.json({ message: "Removed from favorites" });
    } catch (err) {
        res.status(500).json({ message: "Error removing from favorites", error: err });
    }
});

// Get watch later list for user
router.get("/watch-later", authenticateToken, async (req, res) => {
    try {
        const watchLater = await WatchLater.find({ userId: req.user.userId });
        res.json(watchLater);
    } catch (err) {
        res.status(500).json({ message: "Error fetching watch later list", error: err });
    }
});

// Add anime to watch later
router.post("/watch-later", authenticateToken, async (req, res) => {
    try {
        const { animeId, title, description, youtubeEmbedUrl, thumbnailUrl } = req.body;
        
        // Check if already in watch later
        const existing = await WatchLater.findOne({ 
            userId: req.user.userId, 
            animeId 
        });
        
        if (existing) {
            return res.status(400).json({ message: "Anime already in watch later list" });
        }
        
        const watchLater = new WatchLater({
            userId: req.user.userId,
            animeId,
            title,
            description,
            youtubeEmbedUrl,
            thumbnailUrl
        });
        
        await watchLater.save();
        res.json({ message: "Added to watch later", watchLater });
    } catch (err) {
        res.status(500).json({ message: "Error adding to watch later", error: err });
    }
});

// Remove anime from watch later
router.delete("/watch-later/:animeId", authenticateToken, async (req, res) => {
    try {
        await WatchLater.findOneAndDelete({ 
            userId: req.user.userId, 
            animeId: req.params.animeId 
        });
        res.json({ message: "Removed from watch later" });
    } catch (err) {
        res.status(500).json({ message: "Error removing from watch later", error: err });
    }
});

module.exports = router; 