$(document).ready(() => {
    $.get("/api/posts", {followingOnly: true} ,results => {
        outputPosts(results, $(".postsContainer"));
    })
})


$("#searchBox").keydown((event) => {
    clearTimeout(timer);
    let textbox = $(event.target);
    let value = textbox.val();
    // let searchType;
    // if(window.location.href.indexOf("users") > -1){
    //     searchType = "users";
    // }
    // else{
    //     searchType = "posts";
    // }

    timer = setTimeout(() => {
        value = textbox.val().trim();

        if(value == ""){
            $(".resultsContainer").html("");
        }
        else{
            searchBox(value);
        }
    }, 500)
})

function searchBox(searchTerm){

    let url ="/api/users";

    $.get(url, {search: searchTerm}, (results) => {
        // if(searchType == "users"){
            outputUsersList(results, $(".resultsContainer"));
        // }
        // else{
            
        //     outputPosts(results, $(".resultsContainer"));
        //     if(results.length == 0) {
        //         $(".resultsContainer").append("<span class='noResults'>No results found</span>")
        //     }
        // }
    })

}

function outputUsersList(results, container){
    container.html("");

    results.forEach(result => {
        let html = createUserHtml(result, false);
        container.append(html);
    });

    if(results.length == 0){
        container.append("<span class='noResults'>No results found</span>");
    }
}
