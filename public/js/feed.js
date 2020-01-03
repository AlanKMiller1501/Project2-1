$(document).ready(function() {
  // eslint-disable-next-line indent
  /* global moment */

  // blogContainer holds all of our posts
  var feedContainer = $(".feed-container");
  var postCategorySelect = $("#category");
  var authorSelect = $("#author");
  var MemberId; 
  var currentPost;
  var id;
  var listOption;
  var comment = $("#message-text");
  // Click events for the edit and delete buttons
  $(document).on("click", "button.delete", handlePostDelete);
  $(document).on("click", "#commentSubmit", handleComment);
  $(document).on("click", "button.edit", thisTest);

  // Variable to hold our posts
  var posts;

  // The code below handles the case where we want to get blog posts for a specific author
  // Looks for a query param in the url for author_id
  var url = window.location.search;
  var memberId;
  if (url.indexOf("?member_id=") !== -1) {
    memberId = url.split("=")[1];
    console.log(memberId)
    getPosts(memberId);
  }
  // If there's no authorId we just get all posts as usual
  else {
    getPosts();
  }

  // This function grabs posts from the database and updates the view
  function getPosts(member) {
    memberId = member || "";
    if (memberId) {
      memberId = "/?member_id=" + memberId;
    }
    $.get("/api/posts" + memberId, function(data) {
      console.log("Posts", data);
      posts = data;
      if (!posts || !posts.length) {
        displayEmpty(member);
      } else {
        initializeRows();
      }
    });
  }

  // This function does an API call to delete posts
  function deletePost(id) {
    $.ajax({
      method: "DELETE",
      url: "/api/posts/" + id
    }).then(function() {
      getPosts(postCategorySelect.val());
    });
  }

  function updateComment(newComment) {
    $.ajax({
      method: "PUT",
      url: "/api/posts/" + newComment.id,
      data: newComment,
    }).then(function(){
      getPosts(postCategorySelect.val());
    })
  }

  // InitializeRows handles appending all of our constructed post HTML inside blogContainer
  function initializeRows() {
    feedContainer.empty();
    var postsToAdd = [];
    for (var i = 0; i < posts.length; i++) {
      postsToAdd.push(createNewRow(posts[i]));
    }
    feedContainer.append(postsToAdd);
  }

  // This function constructs a post's HTML
  function createNewRow(post) {
    var formattedDate = new Date(post.createdAt);
    formattedDate = moment(formattedDate).format("MMMM Do YYYY, h:mm:ss a");
    var newPostCard = $("<div>");
    newPostCard.addClass("card");
    var newPostCardHeading = $("<div>");
    newPostCardHeading.addClass("card-header");
    var deleteBtn = $("<button>");
    deleteBtn.text("x");
    deleteBtn.addClass("delete btn btn-danger");
    var editBtn = $("<button>");
    editBtn.text("Leave a Comment");
    editBtn.addClass("edit btn btn-info");
    editBtn.attr("data-toggle","modal");
    editBtn.attr("data-target","#commentModal");
    var newPostTitle = $("<h2>");
    var newPostDate = $("<small>");
    var newPostAuthor = $("<h5>");
    var commentAuthor = $("<h7>")
    commentAuthor.text(post.comment_author)
    newPostAuthor.text("Written by: " + post.Member.name);
    newPostAuthor.css({
      float: "right",
      color: "dark gray",
      "margin-top": "-10px"
    });
    var newPostCardBody = $("<div>");
    newPostCardBody.addClass("card-body");
    var newPostBody = $("<p>");
    var newPostCategory = $("<h5>");
    var newPostRating = $("<h5>")
    var newPostCardComments = $("<div>");
    var newPostCommentHeading = $("<h5>");
    var newPostComments = $("<div>");
    newPostComments.addClass("card-body");
    var newPostCommentsBody = $("<p>");
    var newPostCommentsFooter = $("<div>");
    newPostTitle.text(post.title + " ");
    newPostBody.text(post.body);
    newPostCategory.text("Category: " + post.category);
    newPostRating.text("Rating: " + post.rating + "/5");
    newPostDate.text(formattedDate);
    newPostTitle.append(newPostDate);
    newPostCardHeading.append(deleteBtn);
    // newPostCardHeading.append(editBtn);
    newPostCardHeading.append(newPostTitle);
    newPostCardHeading.append(newPostAuthor);
    newPostCardHeading.append(newPostCategory);
    newPostCardHeading.append(newPostRating);
    newPostCardBody.append(newPostBody);
    newPostCommentHeading.text("Comment: ");
    newPostCommentsBody.text(post.comment);
    newPostCommentsFooter.append(editBtn);
    newPostComments.append(newPostCommentHeading);
    newPostComments.append(commentAuthor);
    newPostComments.append(newPostCommentsBody);
    newPostComments.append(newPostCommentsFooter);
    newPostCard.append(newPostCardHeading);
    newPostCard.append(newPostCardBody);
    newPostCard.append(newPostComments);
    newPostCard.data("post", post);
    return newPostCard;
  }
  // $(".edit").on("shown.bs.modal",thisTest());
  
  
 
  getAuthors();
   // // A function to get Authors and then render our list of Authors
   function getAuthors() {
    $.get("/api/members", renderAuthorList);
  }
  // // Function to either render a list of authors, or if there are none, direct the user to the page
  // // to create an author first
  function renderAuthorList(data) {
    // if (!data.length) {
    //   window.location.href = "/members";
    // }
    $(".hidden").removeClass("hidden");
    var rowsToAdd = [];
    for (var i = 0; i < data.length; i++) {
      rowsToAdd.push(createAuthorRow(data[i]));
    }
    authorSelect.empty();
    console.log(rowsToAdd);
    console.log(authorSelect);
    authorSelect.append(rowsToAdd);
    authorSelect.val(MemberId);
  }

  // Creates the author options in the dropdown
  function createAuthorRow(Member) {
    listOption = $("<option>");
    listOption.attr("value", Member.name);
    listOption.text(Member.name);
    return listOption;
  }
  // This function figures out which post we want to delete and then calls deletePost
  function handlePostDelete() {
    var currentPost = $(this)
      .parent()
      .parent()
      .data("post");
      console.log(currentPost);
    deletePost(currentPost.id);
  }

  function handleComment() {
    var newComment = {
      comment: comment.val().trim(),
      comment_author: authorSelect.val(),
      id: currentPost
    }
    console.log(newComment);
    updateComment(newComment);
    $(".edit").modal('hide');
    console.log(currentPost);
  }

  function thisTest(){
    currentPost = $(this)
    .parent()
    .parent()
    .parent()
    .data("post");
    currentPost = currentPost.id;
    console.log(currentPost)
  }

  // }

  // This function displays a message when there are no posts
  function displayEmpty(id) {
    var query = window.location.search;
    var partial = "";
    if (id) {
      partial = " for Member #" + id;
    }
    blogContainer.empty();
    var messageH2 = $("<h2>");
    messageH2.css({ "text-align": "center", "margin-top": "50px" });
    messageH2.html(
      "No posts yet" +
        partial +
        ", navigate <a href='/post" +
        query +
        "'>here</a> in order to get started."
    );
    blogContainer.append(messageH2);
  }
});

