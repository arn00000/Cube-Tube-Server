const express = require("express");
const router = express.Router();
const Video = require("../models/Video");
const auth = require("../middleware/auth");
const moment = require("moment");

router.post("/:id", auth, async (req, res) => {
  try {
    const { comment } = req.body;
    const userId = req.user._id;
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(400).json({
        msg: "No video found",
      });
    }

    if (comment.length === 0) {
      return res.status(400).json({
        msg: "Please write something on your comment",
      });
    }

    let todayDate = moment().format();

    video.comments.push({
      comment,
      userId,
      userName: req.user.name,
      userImage: req.user.profile_pic,
      date: todayDate,
    });

    video.save();

    return res.json({
      msg: "Comment added successfully",
      video,
    });
  } catch (e) {
    return res.status(400).json({
      msg: "Cannot add comment",
      e,
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const { commentId } = req.body;

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(400).json({
        msg: "No video found",
      });
    }

    const comment = video.comments.find((comment) => (comment._id = commentId));
    if (!comment) {
      return res.status(400).json({
        msg: "No comment found",
      });
    }

    if (comment.userId == req.user._id) {
      video.comments.pull(commentId);
      await video.save();
      return res.json({
        msg: "Comment deleted",
      });
    } else {
      return res.status(400).json({
        msg: "This comment not belong to you",
      });
    }
  } catch (e) {
    return res.status(400).json({
      msg: "Cannot delete comment",
      e,
    });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { commentId, comment } = req.body;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(400).json({
        msg: "No video found",
      });
    }

    const commentFound = video.comments.find(
      (comment) => (comment._id = commentId)
    );
    if (!comment) {
      return res.status(400).json({
        msg: "No comment found",
      });
    }

    let todayDate = moment().format();

    if (commentFound.userId == req.user._id) {
      commentFound.comment = comment;
      commentFound.date = todayDate;
      await video.save();
      return res.json({
        msg: "Comment edit successfully",
      });
    } else {
      return res.status(400).json({
        msg: "This comment not belong to you",
      });
    }
  } catch (e) {
    return res.status(400).json({
      msg: "Cannot edit comment",
      e,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    let video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(400).json({
        msg: "No video found",
      });
    }
    const comments = video.comments;
    if (comments.length === 0) {
      return res.status(400).json({
        msg: "No comment",
      });
    }

    return res.json(comments);
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot get comments",
    });
  }
});

module.exports = router;
