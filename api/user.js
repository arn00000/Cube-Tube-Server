const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const auth = require("../middleware/auth");
require("dotenv").config();

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email.length === 0) {
      return res.status(400).json({
        msg: "Please enter your email",
      });
    }

    let emailFound = await User.findOne({ email });

    if (!emailFound) {
      return res.status(400).json({
        msg: "Email doesn't exist",
      });
    }

    if (password.length === 0) {
      return res.status(400).json({
        msg: "Please enter your password",
      });
    }

    let isMatch = bcrypt.compareSync(password, emailFound.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid Credentials",
      });
    }

    jwt.sign(
      { data: emailFound },
      process.env.SECRET_KEY,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          return res.status(400).json({
            err,
            msg: "Cannot generate token",
          });
        }
        return res.json(token);
      }
    );
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Invalid Credentials2",
    });
  }
});

router.put("/", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);

    if (!user)
      return res.json({
        msg: "User doesn't exist",
      });

    let form = new formidable.IncomingForm();

    form.parse(req, async (e, fields, files) => {
      if (files.profile_pic) {
        let oldPath = files.profile_pic.filepath;
        let newPath =
          path.join(__dirname, "../public/images") +
          `/${files.profile_pic.newFilename}-${files.profile_pic.originalFilename}`;
        let rawData = fs.readFileSync(oldPath);
        fs.writeFileSync(newPath, rawData);
        user.profile_pic = `/${files.profile_pic.newFilename}-${files.profile_pic.originalFilename}`;
        await user.save();
      }
      delete fields.profile_pic;
      await User.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        fields
      );
      return res.json({
        user,
        msg: "Updated successfully",
      });
    });
  } catch (e) {
    return res.json({
      e,
      msg: "Cannot get post",
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    function getRandomColor(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    const arrayColor = [
      "#e63946",
      "#f1faee",
      "#a8dadc",
      "#457b9d",
      "#1d3557",
      "#34a0a4",
    ];
    const { name, email, password, joined } = req.body;

    let nameFound = await User.findOne({ name });

    let emailFound = await User.findOne({ email });

    if (nameFound) {
      return res.status(400).json({
        msg: "Channel Name already exist",
      });
    }

    if (emailFound) {
      return res.status(400).json({
        msg: "Email already exist",
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        msg: "Name must be atleast 2 character",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        msg: "Make sure is a valid email format",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        msg: "Password must be atleast 8 characters",
      });
    }

    if (!nameFound && !emailFound) {
      const user = new User(req.body);
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(password, salt);
      user.password = hash;
      let todayDate = moment().format("MMMM Do YYYY");
      user.joined = todayDate;
      user.color = getRandomColor(arrayColor);
      user.save();
      return res.json({
        msg: "Registered Successfully",
        user,
      });
    } else {
      return res.status(400).json({
        msg: "Failed to register",
      });
    }
  } catch (e) {
    return res.status(400).json({
      msg: "Failed to register (catch)",
      e,
    });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        msg: "No user found",
      });
    }
    return res.json(user);
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot get user",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).json({
        msg: "No user found",
      });
    }
    return res.json(user);
  } catch (e) {
    return res.status(400).json({
      e,
      msg: "Cannot get user",
    });
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({
        msg: "No user found",
      });
    }
    user.profile_pic = "";
    user.save();
    return res.json({
      user,
      msg: "Your profile picture has been deleted",
    });
  } catch (e) {
    return res.status(400).json({
      msg: "Cannot delete profile picture",
      e,
    });
  }
});

module.exports = router;
