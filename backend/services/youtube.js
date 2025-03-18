const axios = require("axios");
const Anime = require("../models/Anime");

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const MAX_VIDEOS = 50;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const verifyChannel = async (channelId, apiKey) => {
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                key: apiKey,
                id: channelId,
                part: 'snippet'
            }
        });

        if (!response.data.items || response.data.items.length === 0) {
            throw new Error("Channel not found");
        }

        return response.data.items[0].snippet.title;
    } catch (error) {
        throw new Error(`Channel verification failed: ${error.message}`);
    }
};

const fetchVideos = async (params, retryCount = 0) => {
    try {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params,
            timeout: 10000
        });

        if (!response.data.items) {
            throw new Error("No videos found in response");
        }

        return {
            videos: response.data.items.map(video => ({
                title: video.snippet.title,
                description: video.snippet.description,
                youtubeEmbedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
                thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url
            })),
            nextPageToken: response.data.nextPageToken
        };
    } catch (error) {
        if (retryCount < MAX_RETRIES) {
            console.log(`Retry attempt ${retryCount + 1} after error:`, error.message);
            await sleep(RETRY_DELAY * (retryCount + 1));
            return fetchVideos(params, retryCount + 1);
        }
        throw error;
    }
};

const fetchAndStoreAnime = async () => {
    if (!process.env.YOUTUBE_API_KEY) {
        throw new Error("YouTube API key is missing");
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID || "UCP8E_gJhRMApuQYOQ21MkLA";

    try {
        console.log("Starting YouTube data fetch...");

        // Verify channel exists
        const channelTitle = await verifyChannel(channelId, apiKey);
        console.log(`Channel verified: ${channelTitle}`);

        let videos = [];
        let nextPageToken = null;

        do {
            const params = {
                key: apiKey,
                channelId: channelId,
                part: "snippet",
                type: "video",
                maxResults: Math.min(50, MAX_VIDEOS - videos.length),
                order: "date",
                ...(nextPageToken && { pageToken: nextPageToken })
            };

            console.log(`Fetching videos... Current count: ${videos.length}`);
            const result = await fetchVideos(params);
            
            videos = [...videos, ...result.videos];
            nextPageToken = result.nextPageToken;

            console.log(`Fetched ${result.videos.length} new videos. Total: ${videos.length}`);

            if (videos.length >= MAX_VIDEOS || !nextPageToken) {
                break;
            }
        } while (true);

        if (videos.length > 0) {
            console.log(`Storing ${videos.length} videos in database...`);
            await Anime.deleteMany({});
            await Anime.insertMany(videos);
            console.log("Videos stored successfully");
            
            return {
                success: true,
                videosCount: videos.length,
                message: "Anime data updated successfully"
            };
        } else {
            throw new Error("No videos were fetched");
        }
    } catch (error) {
        console.error("Error in fetchAndStoreAnime:", error);
        throw new Error(`Failed to fetch and store anime: ${error.message}`);
    }
};

module.exports = {
    fetchAndStoreAnime
}; 