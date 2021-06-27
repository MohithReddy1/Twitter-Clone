$(document).ready(() => {

    if(window.location.href.indexOf("users") > -1){
        document.getElementById("Users").classList.add("active");
        document.getElementById("Tweets").classList.remove("active");
        $(".titlecontainer").html = "<span class='backward'><a href='javascript:history.back()'><img src='/images/back.svg' alt='back'></a></span>";
    }
});


$("#searchBox").keydown((event) => {
    clearTimeout(timer);
    let textbox = $(event.target);
    let value = textbox.val();
    let searchType;
    if(window.location.href.indexOf("users") > -1){
        searchType = "users";
    }
    else{
        searchType = "posts";
    }

    timer = setTimeout(() => {
        value = textbox.val().trim();

        if(value == ""){
            $(".resultsContainer").html("");
        }
        else{
            search(value, searchType);
        }
    }, 500)
})

function search(searchTerm, searchType){

    let url = searchType == "users" ? "/api/users" : "/api/posts"

    $.get(url, {search: searchTerm}, (results) => {
        if(searchType == "users"){
            outputUsers(results, $(".resultsContainer"));
        }
        else{
            
            outputPosts(results, $(".resultsContainer"));
            if(results.length == 0) {
                $(".resultsContainer").append("<span class='noResults'>No results found</span>")
            }
        }
    })



}