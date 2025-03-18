const mongoose = require("mongoose");

const animeSchema = new mongoose.Schema({
    title: String,
    description: String,
    youtubeEmbedUrl: String,
    thumbnailUrl: String
});

module.exports = mongoose.model("Anime", animeSchema); 