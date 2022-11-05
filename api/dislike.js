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

    const disliked = video.dislike.find((dislike) => dislike.userId == userId);

    if (!disliked) {
      video.dislike.push({
        userId,
      });
      await video.save();
      return res.json({
        msg: "Video disliked",
        video,
      });
    } else {
      await video.dislike.pull({
        userId: disliked.userId,
        _id: disliked._id,
      });
      await video.save();
      return res.json({
        msg: "Remove disliked from this video",
        video,
      });
    }
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot dislike",
    });
  }
});

module.exports = router;
