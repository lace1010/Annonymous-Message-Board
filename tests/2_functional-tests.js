const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  let testThreadId;
  let testReplyId;
  let testPassword = "test pass";
  test("Creating a new thread: POST request to /api/threads/{board}", (done) => {
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
        console.log(testThreadId, "<= testThreadId");
        done();
      });
  });
  // NOT GETTING ANYTHING... WHY?
  console.log(testThreadId, " <= testThreadId");

  test("Creating a new reply: POST request to /api/replies/{board}", (done) => {
    chai
      .request(server)
      .post("/api/replies/test")
      .send({
        threadId: testThreadId,
        text: "what is life",
        delete_password: testPassword,
      })
      .end((err, res) => {
        console.log(res, "<= res.redirects");
        assert.equal(res.status, 200);
        done();
      });
  });
});
