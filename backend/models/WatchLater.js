const mongoose = require("mongoose");

const WatchLaterSchema = new mongoose.Schema({
    userId: String,
    animeId: String,
    title: String,
    description: String,
    youtubeEmbedUrl: String,
    thumbnailUrl: String
});

module.exports = mongoose.model("WatchLater", WatchLaterSchema); 