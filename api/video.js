const express = require("express");
const router = express.Router();
const Video = require("../models/Video");
const Playlist = require("../models/Playlist");
const auth = require("../middleware/auth");
const moment = require("moment");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { getVideoDurationInSeconds } = require("get-video-duration");

router.post("/", auth, async (req, res) => {
  try {
    let form = new formidable.IncomingForm();
    form.multiples = true;
    form.parse(req, async (e, fields, files) => {
      if (
        fields.title.length === 0 ||
        fields.title == "undefined" ||
        !fields.title
      ) {
        return res.status(400).json({
          msg: "Please name a title",
        });
      }

      if (
        fields.description.length === 0 ||
        fields.description == "undefined" ||
        !fields.description
      ) {
        return res.status(400).json({
          msg: "Please write your description",
        });
      }

      if (!files.thumbnail) {
        return res.status(400).json({
          msg: "Please upload a picture for the thumbnail",
        });
      }

      if (!files.video) {
        return res.status(400).json({
          msg: "Please upload a video",
        });
      }

      const video = new Video(fields);

      let oldPath = files.video.filepath;
      let newPath =
        path.join(__dirname, "../public/videos") +
        `/${files.video.newFilename}-${files.video.originalFilename}`;
      let rawData = fs.readFileSync(oldPath);
      fs.writeFileSync(newPath, rawData);
      video.video = `/${files.video.newFilename}-${files.video.originalFilename}`;

      let oldImagePath = files.thumbnail.filepath;
      let newImagePath =
        path.join(__dirname, "../public/images") +
        `/${files.thumbnail.newFilename}-${files.thumbnail.originalFilename}`;
      let rawImageData = fs.readFileSync(oldImagePath);
      fs.writeFileSync(newImagePath, rawImageData);
      video.thumbnail = `/${files.thumbnail.newFilename}-${files.thumbnail.originalFilename}`;

      video.publisher_id = req.user._id;
      video.publisher_name = req.user.name;
      video.publisher_image = req.user.profile_pic;

      const duration = await getVideoDurationInSeconds(
        files.video.filepath
      ).then((duration) => {
        let hours = Math.floor(duration / 3600);
        let minutes = Math.floor(duration / 60);
        let seconds = Math.floor(duration % 60);
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        return Promise.resolve(minutes + ":" + seconds);
      });

      video.duration = duration;
      let uploadDate = moment().format();
      video.published = uploadDate;

      video.save();
      return res.json({
        msg: "Uploaded Successfully",
      });
    });
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Failed to upload",
    });
  }
});

router.get("/all", async (req, res) => {
  try {
    let videos = await Video.find({});

    if (videos.length === 0) {
      return res.status(400).json({
        msg: "No videos found",
      });
    }

    return res.json(videos);
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot retrieve videos",
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
    return res.json(video);
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot get video",
    });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const video = await Video.find({ publisher_id: req.user._id });
    return res.json(video);
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot get video",
    });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const video = await Video.find({ publisher_id: req.params.id });
    return res.json(video);
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot get video",
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    let video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(400).json({
        msg: "No video found",
      });
    }

    if (video.publisher_id != req.user._id) {
      return res.json({
        video,
        msg: "This is not your video",
      });
    }

    let newVideo = await Video.findByIdAndDelete(req.params.id);

    return res.json({
      newVideo,
      msg: "This video has been deleted",
    });
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot delete video",
    });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    let videos = await Video.findById(req.params.id);

    if (!videos) {
      return res.status(400).json({
        msg: "No video found",
      });
    }

    if (videos.publisher_id != req.user._id) {
      return res.status(400).json({
        msg: "This is not your video",
      });
    }

    let form = new formidable.IncomingForm();

    form.parse(req, async (e, fields, files) => {
      if (files.thumbnail) {
        let oldPath = files.thumbnail.filepath;
        let newPath =
          path.join(__dirname, "../public/images") +
          `/${files.thumbnail.newFilename}-${files.thumbnail.originalFilename}`;
        let rawData = fs.readFileSync(oldPath);
        fs.writeFileSync(newPath, rawData);
        videos.thumbnail = `/${files.thumbnail.newFilename}-${files.thumbnail.originalFilename}`;
        await videos.save();
      }
      delete fields.thumbnail;

      if (files.video) {
        let oldPath = files.video.filepath;
        let newPath =
          path.join(__dirname, "../public/videos") +
          `/${files.video.newFilename}-${files.video.originalFilename}`;
        let rawData = fs.readFileSync(oldPath);
        fs.writeFileSync(newPath, rawData);
        videos.video = `/${files.video.newFilename}-${files.video.originalFilename}`;
        await videos.save();
      }
      delete fields.video;

      await Video.findOneAndUpdate({ _id: req.params.id }, fields);
      return res.json({
        videos,
        msg: "Updated successfully",
      });
    });
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot update video",
    });
  }
});

router.post("/search", async (req, res) => {
  try {
    let videos = await Video.find({});
    // const keys = ["title"];
    let result = [];
    const { search } = req.body;
    if (videos.length === 0) {
      return res.status(400).json({
        msg: "No videos found",
      });
    } else {
      videos.map((data, i) => {
        let t = data.title;
        if (t.toLowerCase().includes(search.toLowerCase())) {
          result.push(data);
        }
      });
    }
    // else {
    //   videos.filter((video) =>
    //     keys.some((key) => {
    //       if (video[key].toLowerCase().includes(search.toLowerCase())) {
    //         result.push(video);
    //       }
    //     })
    //   );
    // }

    return res.json(result);
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot search videos",
    });
  }
});

module.exports = router;
