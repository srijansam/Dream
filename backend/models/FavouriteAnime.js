const mongoose = require("mongoose");

const FavouriteAnimeSchema = new mongoose.Schema({
    userId: String,
    animeId: String,
    title: String,
    description: String,
    youtubeEmbedUrl: String,
    thumbnailUrl: String
});

module.exports = mongoose.model("FavouriteAnime", FavouriteAnimeSchema); 