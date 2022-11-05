const express = require("express");
const router = express.Router();
const Playlist = require("../models/Playlist");
const Video = require("../models/Video");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const { title } = req.body;

    if (title.length === 0) {
      return res.status(400).json({
        msg: "Please give a name for your playlist",
      });
    }

    const playlist = new Playlist({
      title,
      user: req.user._id,
    });

    playlist.save();

    return res.json({
      msg: "Playlist created successfully",
    });
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot create playlist",
    });
  }
});

router.post("/add/:id", auth, async (req, res) => {
  try {
    const { videoId } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    const video = await Video.findById(videoId);

    if (!playlist) {
      return res.status(400).json({
        msg: "There are no playlist",
      });
    }

    if (playlist.user != req.user._id) {
      return res.status(400).json({
        msg: "This is not your playlist",
      });
    }

    const addVideo = playlist.videos.find((video) => video.videoId == videoId);

    if (!addVideo) {
      playlist.videos.push({
        videoId,
        playlistId: req.params.id,
      });
      await playlist.save();
      return res.json({
        msg: "Video Added to playlist",
        playlist,
      });
    } else {
      await playlist.videos.pull({
        videoId: addVideo.videoId,
        _id: addVideo._id,
        playlistId: addVideo.playlistId,
      });
      await playlist.save();
      return res.json({
        msg: "Video has been remove from your playlist",
        playlist,
      });
    }
    //find also if the user has that exsting playlist
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot add to playlist",
    });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const playlist = await Playlist.find({ user: req.user._id });
    return res.json(playlist);
  } catch (e) {
    return res.status(400).json({
      msg: "Cannot get playlist",
      e,
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(400).json({
        msg: "Playlist not found",
      });
    }
    return res.json(playlist);
  } catch (e) {
    return res.status(400).json({
      msg: "Cannot get playlist's video",
      e,
    });
  }
});

router.post("/video/:id", auth, async (req, res) => {
  try {
    // console.log(req.body);
    // return;
    const playlist = await Playlist.findById(req.params.id);
    const { videoId } = req.body;
    if (!playlist) {
      return res.status(400).json({
        msg: "Playlist not found",
      });
    }

    if (videoId == " " || videoId.length == 0) {
      return res.status(400).json({
        msg: "No video in playlist",
      });
    }

    const video = playlist.videos.find((video) => video._id == videoId);
    if (!video) {
      return res.status(400).json({
        msg: "This video not in the playlist",
      });
    }

    return res.json(video);
  } catch (e) {
    return res.status(400).json({
      msg: "Cannot get this video from playlist",
      e,
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(400).json({
        msg: "Playlist not found",
      });
    }

    const delPlaylist = await Playlist.findByIdAndDelete(req.params.id);
    return res.json({
      delPlaylist,
      msg: "This playlist has been deleted",
    });
  } catch (e) {
    return res.status(400).json({
      msg: "Failed to delete",
      e,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    let playlist = await Playlist.findById(req.params.id);
    if (!playlist)
      return res.status(400).json({
        msg: "No playlist found",
      });
    let newPlaylist = await Playlist.findByIdAndUpdate(req.params.id, req.body);
    return res.json({
      newPlaylist,
      msg: "This playlist name has been updated",
    });
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Failed to edit",
    });
  }
});

module.exports = router;
