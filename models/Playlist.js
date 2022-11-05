const mongoose = require("mongoose");

const PlaylistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
  },
  videos: [
    {
      videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
      playlistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Playlist",
      },
    },
  ],
});

module.exports = mongoose.model("playlist", PlaylistSchema);
