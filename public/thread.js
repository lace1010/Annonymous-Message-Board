$(function () {
  var currentURL = window.location.pathname.slice(3);
  currentURL = currentURL.split("/");

  var url = "/api/replies/" + currentURL[0];

  $("#threadTitle").text(window.location.pathname);
  $.ajax({
    type: "GET",
    url: url,
    data: { thread_id: currentURL[1] },
    success: function (ele) {
      // Add a link back to board
      $("#linkBackToBoard").text("back to " + ele.board);
      $("#linkBackToBoard").attr("href", "/b/" + ele.board + "/");
      var boardThreads = [];
      //
      // THIS ARRAY SET UP IS FOR CODE READABILITIES AND TESTING!
      // THIS IS NOT WHAT IT WOULD LOOK LIKE TO GO LIVE
      //
      console.log(ele); //can I use typeScript please?!
      // To display normal date we must create a new date form here for toDateString() to work in each thread.
      let created_on = new Date(ele.created_on);
      var thread = ['<div class="thread">'];
      thread.push('<div class="main"><div class="mainBesidesText">');
      thread.push(
        '<p class="id">id: ' +
          ele._id +
          "<span class='date'>Date: " +
          created_on.toDateString() +
          "</span></p>"
      );

      thread.push(
        '<div id="deleteAndReportContainer"><form id="deleteThread"><input type="hidden" value="' +
          ele._id +
          '" name="thread_id" required=""><input type="text" placeholder="password" name="delete_password" required=""><input id="deleteThreadButton" class="threadInputButtons" type="submit" value="Delete"></form>'
      );
      thread.push(
        '<form id="reportThread"><input type="hidden" name="report_id" value="' +
          ele._id +
          '"><input class="threadInputButtons" type="submit" value="Report"></form></div></div>'
      );
      thread.push("<h3>" + ele.text + "</h3>");
      thread.push('</div><div class="replies">');
      ele.replies.forEach(function (rep) {
        let replyCreatedOn = new Date(rep.created_on);
        thread.push('<div class="reply">');
        thread.push(
          '<div class="replyInfoAndForms"><p class="id">id: ' +
            rep._id +
            "<span class='date'>Date: " +
            replyCreatedOn.toDateString() +
            "</span></p>"
        );

        thread.push(
          '<div class="replyFormContainer"><form id="deleteReply"><input type="hidden" value="' +
            ele._id +
            '" name="thread_id" required=""><input type="hidden" value="' +
            rep._id +
            '" name="reply_id" required=""><input class="replyInput" type="text" placeholder="password" name="delete_password" required=""><input id="deleteReplyButtons" class="replyInputButtons" type="submit" value="Delete"></form>'
        );
        thread.push(
          '<form id="reportReply"><input type="hidden" name="thread_id" value="' +
            ele._id +
            '"><input type="hidden" name="reply_id" value="' +
            rep._id +
            '"><input class="replyInputButtons" type="submit" value="Report"></form></div></div>'
        );
        thread.push("<p class='replyText'>" + rep.text + "</p>");
        thread.push("</div>");
      });
      thread.push('<div class="newReply">');
      thread.push(
        '<form action="/api/replies/' +
          currentURL[0] +
          '/" method="post" id="newReply">'
      );
      thread.push(
        '<input type="hidden" name="thread_id" value="' + ele._id + '">'
      );
      thread.push(
        '<textarea  class="replyTextarea" type="text" placeholder="Quick reply..." name="text" required=""></textarea><br>'
      );
      thread.push(
        '<input type="text" placeholder="password to delete" name="delete_password" required=""><input class="quickReplyButton" style="margin-left: 5px" type="submit" value="Submit">'
      );
      thread.push("</form></div></div></div>");
      boardThreads.push(thread.join(""));
      $("#boardDisplay").html(boardThreads.join(""));
    },
  });

  $("#newThread").submit(function () {
    $(this).attr("action", "/api/threads/" + currentBoard);
  });

  $("#boardDisplay").on("submit", "#reportThread", function (e) {
    var url = "/api/threads/" + currentURL[0];
    $.ajax({
      type: "PUT",
      url: url,
      data: $(this).serialize(),
      success: function (data) {
        alert(data);
      },
    });
    e.preventDefault();
  });
  $("#boardDisplay").on("submit", "#reportReply", function (e) {
    var url = "/api/replies/" + currentURL[0];
    $.ajax({
      type: "PUT",
      url: url,
      data: $(this).serialize(),
      success: function (data) {
        alert(data);
      },
    });
    e.preventDefault();
  });
  $("#boardDisplay").on("submit", "#deleteThread", function (e) {
    var url = "/api/threads/" + currentURL[0];
    $.ajax({
      type: "DELETE",
      url: url,
      data: $(this).serialize(),
      success: function (data) {
        alert(data);
        window.location.reload();
      },
    });
    e.preventDefault();
  });
  $("#boardDisplay").on("submit", "#deleteReply", function (e) {
    var url = "/api/replies/" + currentURL[0];
    $.ajax({
      type: "DELETE",
      url: url,
      data: $(this).serialize(),
      success: function (data) {
        alert(data);
        window.location.reload();
      },
    });
    e.preventDefault();
  });
});
