"use strict";
const mongoose = require("mongoose");

module.exports = function (app) {
  let uri = process.env.ANONYMOUS_MESSAGE_BOARD_MONGO_URI;
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
  const Schema = mongoose.Schema;
  // Use the next four lines to see if you are conneted to mongoose correctly
  // var db = mongoose.connection;
  // db.on("error", console.error.bind(console, "connection error:"));
  // db.once("open", () => {
  //   console.log("Connection Successful!");
  // });

  const threadSchema = new Schema({
    board: { type: String, required: true },
    text: { type: String, required: true },
    delete_password: { type: String, required: true },
    replies: [Object],
    createdOn: { type: Date, default: Date.now() },
    bumpedOn: Date,
    reported: Boolean,
  });

  const Thread = mongoose.model("Thread", threadSchema);
  app.route("/api/threads/:board");

  app.route("/api/replies/:board");
};
