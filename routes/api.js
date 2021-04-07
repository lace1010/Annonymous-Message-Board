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

  const replySchema = new Schema({
    text: { type: String, required: true },
    delete_password: { type: String, required: true },
    created_on: { type: Date, default: new Date() },
    reported: { type: Boolean, required: true },
  });
  const Reply = mongoose.model("Reply", replySchema);

  const threadSchema = new Schema({
    board: { type: String, required: true }, // Name of board that goes in URL
    text: { type: String, required: true }, // Text that is basically title of the thread
    delete_password: { type: String, required: true },
    created_on: { type: Date, default: new Date(), required: true },
    bumped_on: { type: Date, default: new Date(), required: true },
    reported: { type: Boolean, required: true },
    replies: [replySchema], // This needs to be accepting objects from another model
    replycount: Number,
  });

  const Thread = mongoose.model("Thread", threadSchema);

  app
    .route("/api/threads/:board/")
    .post((req, res) => {
      let thread = new Thread({
        board: req.body.board,
        text: req.body.text,
        delete_password: req.body.delete_password,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        replies: [],
        replycount: 0,
      });
      thread.save((error, savedThread) => {
        if (error) return console.log(error);
        else if (!error && savedThread) {
          // req.session.thread = savedThread._id;
          return res.redirect(
            "/b/" +
              savedThread.board +
              "/" +
              savedThread._id /* Need this part for functional tests */
          );
        }
      });
    })

    .get((req, res) => {
      // Get array of threads with the board name and return them in res.json so we can display them with front end board.js
      Thread.find({ board: req.params.board })
        .limit(10)
        .sort({ bumped_on: "descending" })
        .exec((error, arrayOfThreads) => {
          if (error) return console.log(error);
          else if (!error && arrayOfThreads) {
            arrayOfThreads.forEach((thread) => {
              thread.replycount = thread.replies.length;

              // Sort replies from most recent to least
              thread.replies.sort((thread1, thread2) => {
                return thread2.created_on - thread1.created_on;
              });

              // Only show last three replies
              thread.replies = thread.replies.slice(0, 3);
            });

            res.json(arrayOfThreads);
          }
        });
    })
    .delete((req, res) => {
      Thread.findOneAndDelete(
        {
          _id: req.body.thread_id,
          delete_password: req.body.delete_password,
        },
        (error, successful) => {
          if (error) return res.json("incorrect password");
          else if (!error && !successful) return res.json("incorrect password");
          else if (!error && successful) return res.json("succes");
        }
      );
    })
    .put((req, res) => {
      console.log(req.body, "<= req.body");
      let id = req.body.thread_id;
      let update = { reported: true };
      let options = { new: true };
      Thread.findByIdAndUpdate(id, update, options, (error, updatedDoc) => {
        if (error) return res.json("Thread id does not exist with this board");
        else return res.json("success");
      });
    });

  app
    .route("/api/replies/:board")
    .post((req, res) => {
      let newReply = new Reply({
        text: req.body.text,
        delete_password: req.body.delete_password,
        created_on: new Date(),
        reported: false,
      });

      // Use findByIdAndUpdate to update thread by adding reply to its reply array
      Thread.findByIdAndUpdate(
        req.body.thread_id, // Find object by thread_id
        {
          $push: { replies: newReply },
          bumped_on: new Date(),
        },
        { new: true },
        (error, updatedThread) => {
          if (!error && updatedThread) {
            return res.redirect(
              "/b/" + updatedThread.board + "/" + updatedThread._id
            );
          }
        }
      );
    })

    //.get to show things in this site
    .get((req, res) => {
      let id = req.query.thread_id;
      Thread.findById(id).exec((error, foundThread) => {
        if (error) return console.log(error);
        else if (!error && foundThread) {
          // Sort replies from most recent to least
          foundThread.replies.sort((reply1, reply2) => {
            return reply2.created_on - reply1.created_on;
          });
          return res.json(foundThread);
        }
      });
    })
    .delete((req, res) => {
      let correctReplyId = false; // use this variable to call on save if changed to true
      console.log(req.body, "<= req.body");
      // find a way to search through each replies (maybe findOneAndDelete inside a findOne)
      Thread.findById(req.body.thread_id, (error, threadToUpdate) => {
        if (error) return res.json("incorrect thread id");
        else if (!error && threadToUpdate) {
          for (let i = 0; i < threadToUpdate.replies.length; i++) {
            if (threadToUpdate.replies[i]._id == req.body.reply_id) {
              correctReplyId = true;
              if (
                threadToUpdate.replies[i].delete_password ==
                req.body.delete_password
              ) {
                threadToUpdate.replies[i].text = "[deleted]";
                // console.log(threadToUpdate, "<= threadToUpdate");
              } else return res.json("incorrect password");
            }
          }

          if (correctReplyId) {
            threadToUpdate.save((error, updatedThread) => {
              if (error) return console.log(error);
              else if (!error && updatedThread) return res.json("success");
            });
          } else return res.json("incorrect reply id");
        }
      });
    })
    .put((req, res) => {
      let correctReplyId = false;
      Thread.findById(req.body.thread_id, (error, threadToUpdateReply) => {
        if (error) return res.json("incorrect thread id");
        else if (!error && threadToUpdateReply) {
          for (let i = 0; i < threadToUpdateReply.replies.length; i++) {
            if (threadToUpdateReply.replies[i]._id == req.body.reply_id) {
              correctReplyId = true;
              threadToUpdateReply.replies[i].reported = true;
            }
          }

          if (correctReplyId) {
            threadToUpdateReply.save((error, updatedReport) => {
              if (error) return console.log(error);
              else if (!error && updatedReport) return res.json("success");
            });
          } else return res.json("incorrect reply id");
        }
      });
    });
};
