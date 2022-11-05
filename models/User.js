const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  profile_pic: {
    type: String,
  },
  joined: {
    type: String,
  },
  color: {
    type: String,
  },
  follow: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
      },
      profile_pic: {
        type: String,
      },
    },
  ],
  following: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
      },
      profile_pic: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("user", UserSchema);
