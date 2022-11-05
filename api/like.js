const express = require("express");
const router = express.Router();
const Video = require("../models/Video");
const auth = require("../middleware/auth");

router.post("/:id", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    let video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(400).json({
        msg: "No video found",
      });
    }

    const liked = video.like.find((like) => like.userId == userId);

    if (!liked) {
      video.like.push({
        userId,
      });
      await video.save();
      return res.json({
        msg: "Video Liked",
        video,
      });
    } else {
      await video.like.pull({
        userId: liked.userId,
        _id: liked._id,
      });
      await video.save();
      return res.json({
        msg: "Video unliked",
        video,
      });
    }
  } catch (e) {
    return res.status(400).json({
      msg: "Cannot like this video",
      e,
    });
  }
});

module.exports = router;
