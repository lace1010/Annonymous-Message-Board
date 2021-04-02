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
  var db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    console.log("Connection Successful!");
  });

  app.route("/api/threads/:board");

  app.route("/api/replies/:board");
};
