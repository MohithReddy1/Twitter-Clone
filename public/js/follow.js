$(document).ready(() => {

    if(window.location.href.indexOf("followers") > -1){
        document.getElementById("Followers").classList.add("active");
        document.getElementById("Following").classList.remove("active");
        $(".titlecontainer").html = "<span class='backward'><a href='javascript:history.back()'><img src='/images/back.svg' alt='back'></a></span>";
        loadFollowers()
    }
    else{
        loadFollowing();
    } 
});

function loadFollowers(){
    $.get(`/api/users/${profileUserId}/followers`, results => {
        outputUsers(results.followers, $(".resultsContainer"));
    })
}

function loadFollowing(){
    $.get(`/api/users/${profileUserId}/following`, results => {
        outputUsers(results.following, $(".resultsContainer"));
    })
}