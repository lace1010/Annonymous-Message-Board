const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let testThreadId;
  let testReplyId;
  let testPassword = "test pass";

  test("Post a new thread to a board", (done) => {
    chai
      .request(server)
      .post("/api/threads/test")
      .send({
        board: "test",
        text: "what is life",
        delete_password: testPassword,
      })
      .end((err, res) => {
        let splitArray = res.redirects[0].split("/");
        assert.equal(res.status, 200);
        let createThreadId = splitArray[splitArray.length - 1];
        testThreadId = createThreadId;
        done();
      });
  });

  test("Get threads from a board ", (done) => {
    chai
      .request(server)
      .get("/api/threads/test")
      .send()
      .end((err, res) => {
        assert.isArray(res.body);
        let firstThread = res.body[0];
        assert.equal(firstThread.delete_password, testPassword);
        assert.isAtMost(res.body.length, 10);
        assert.isAtMost(firstThread.replies.length, 3);
        done();
      });
  });

  test("Report a Thread with PUT", (done) => {
    chai
      .request(server)
      .put("/api/threads/test")
      .send({
        thread_id: testThreadId,
      })
      .end((err, res) => {
        assert.equal(res.body, "success");
        done();
      });
  });

  // POSTED A REPLY ONTO OUR THREAD
  test("Post a reply on a Thread ", (done) => {
    chai
      .request(server)
      .post("/api/replies/test")
      .send({
        thread_id: testThreadId,
        text: "Test Reply from Functional Test",
        delete_password: testPassword,
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        let splitArray = res.redirects[0].split("=");
        testReplyId = splitArray[splitArray.length - 1];
        done();
      });
  });

  test("Get replies on a Thread", (done) => {
    chai
      .request(server)
      .get("/api/replies/test")
      .query({ thread_id: testThreadId })
      .send()
      .end((err, res) => {
        let thread = res.body;
        assert.equal(res.status, 200);
        assert.equal(thread._id, testThreadId);
        assert.isArray(thread.replies);
        assert.equal(thread.replies[0].delete_password, testPassword);
        done();
      });
  });

  test("Report a reply with PUT", (done) => {
    chai
      .request(server)
      .put("/api/replies/test")
      .send({
        thread_id: testThreadId,
        reply_id: testReplyId,
      })
      .end((err, res) => {
        assert.equal(res.body, "success");
        done();
      });
  });

  test("Delete a reply with invalid password", (done) => {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({
        thread_id: testThreadId,
        reply_id: testReplyId,
        delete_password: "invalid password",
      })
      .end((err, res) => {
        assert.equal(res.body, "incorrect password");
        done();
      });
  });

  test("Delete a reply with valid password", (done) => {
    chai
      .request(server)
      .delete("/api/replies/test")
      .send({
        thread_id: testThreadId,
        reply_id: testReplyId,
        delete_password: testPassword,
      })
      .end((err, res) => {
        assert.equal(res.body, "success");
        done();
      });
  });

  test("Delete a Thread with invalid password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/test")
      .send({
        thread_id: testThreadId,
        delete_password: "invalid password",
      })
      .end((err, res) => {
        assert.equal(res.body, "incorrect password");
        done();
      });
  });

  test("Delete a Thread with valid password", (done) => {
    chai
      .request(server)
      .delete("/api/threads/test")
      .send({
        thread_id: testThreadId,
        delete_password: testPassword,
      })
      .end((err, res) => {
        assert.equal(res.body, "success");
        done();
      });
  });
});
