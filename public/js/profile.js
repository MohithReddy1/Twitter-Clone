$(document).ready(() => {

    if(window.location.href.indexOf("replies") > -1){
        document.getElementById("Replies").classList.add("active");
        document.getElementById("Tweets").classList.remove("active");
        $(".titlecontainer").html = "<span class='backward'><a href='javascript:history.back()'><img src='/images/back.svg' alt='back'></a></span>";
        loadReplies()
    }
    else{
        loadTweets();
    }
});

function loadTweets(){
    $.get("/api/posts", { postedBy:profileUserId, isReply:false }, results => {
        outputPosts(results, $(".postsContainer"));
        if(results.length == 0) {
            $(".postsContainer").append("<span class='noResults'>No results found</span>")
        }
    })
}

function loadReplies(){
    $.get("/api/posts", { postedBy:profileUserId, isReply:true }, results => {
        outputPosts(results, $(".postsContainer"));
        if(results.length == 0) {
            $(".postsContainer").append("<span class='noResults'>No results found</span>")
        }
    })
}