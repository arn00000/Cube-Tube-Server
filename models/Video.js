const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  video: {
    type: String,
  },
  publisher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  publisher_name: {
    type: String,
  },
  publisher_image: {
    type: String,
  },
  published: {
    type: String,
  },
  duration: {
    type: String,
  },
  like: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  dislike: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  comments: [
    {
      userImage: {
        type: String,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      userName: {
        type: String,
      },
      comment: {
        type: String,
      },
      date: {
        type: String,
      },
    },
  ],
  thumbnail: {
    type: String,
  },
});

module.exports = mongoose.model("video", VideoSchema);
