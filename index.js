const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8000;
const cors = require("cors");

require("dotenv").config();
app.use(cors());
app.use(express.json());
app.use(express.static("public/videos"));
app.use(express.static("public/images"));

// const { PORT, DB_HOST, DB_PORT, DB_NAME } = process.env;
// mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);
mongoose.connect(
  "mongodb+srv://comingsoon:qweqweqwe@cluster0.uuosu55.mongodb.net/?retryWrites=true&w=majority"
);

app.use("/user", require("./api/user"));
app.use("/video", require("./api/video"));
app.use("/playlist", require("./api/playlist"));
app.use("/like", require("./api/like"));
app.use("/dislike", require("./api/dislike"));
app.use("/comment", require("./api/comment"));
app.use("/follow", require("./api/follow"));

app.listen(PORT, () => console.log("Server is running in PORT " + PORT));

mongoose.connection.once("open", () =>
  console.log("We are connected to MongoDB")
);
