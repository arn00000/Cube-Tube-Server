const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

router.post("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const userId = req.user._id;

    const user2 = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        msg: "User not found",
      });
    }

    const follower = user.follow.find((follower) => follower.userId == userId);

    const following = user2.following.find(
      (f) => f.userId.toString() == user._id.toString()
    );

    if (user._id == req.user._id) {
      return res.status(400).json({
        msg: "You cannot follow your own page",
      });
    }

    if (!follower && !following) {
      user.follow.push({
        userId,
        name: user2.name,
        profile_pic: user2.profile_pic,
      });
      user2.following.push({
        userId: user._id,
        name: user.name,
        profile_pic: user.profile_pic,
      });
      await user2.save();
      await user.save();
      return res.json({
        msg: "Followed",
      });
    } else {
      await user.follow.pull({
        userId: follower.userId,
        _id: follower._id,
        name: follower.name,
        profile_pic: follower.profile_pic,
      });
      await user2.following.pull({
        userId: following.userId,
        _id: following._id,
        name: following.name,
        profile_pic: following.profile_pic,
      });
      await user2.save();
      await user.save();
      return res.json({
        msg: "Unfollowed",
      });
    }
  } catch (e) {
    return res.status(400).json({
      msg: "Cannot follow",
      e,
    });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const follower = user.follow;
    if (!follower) {
      return res.status(400).json({
        msg: "There are no follower",
      });
    }
    return res.json(follower);
  } catch (e) {
    return res.status(400).json({
      msg: "Cannot get follower",
      e,
    });
  }
});

module.exports = router;
