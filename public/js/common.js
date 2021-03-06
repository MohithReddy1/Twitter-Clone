// Global Variables
let cropper;
let timer;
let selectedUsers = [];

$(document).ready(() => {
    refreshMessagesBadge();
    refreshNotificationsBadge();
});

$("#postTextArea, #replyTextArea").keyup(eventtext =>{
    let textbox = $(eventtext.target);
    let text = textbox.val().trim();

    let isModal = textbox.parents(".modal").length == 1;
    
    let submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if(text == ""){
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

$("#submitPostButton, #submitReplyButton").click(event =>{
    let button = $(event.target);

    let isModal = button.parents(".modal").length == 1;
    let textbox = isModal ?  $("#replyTextArea") :  $("#postTextArea");

    let data = {
        content: textbox.val()
    }

    if(isModal){
        let id = button.data().id;
        if(id == null) return alert("Button id is null");
        data.replyTo = id;
    }

    $.post("/api/posts", data, postData => {

        if(postData.replyTo){
            emitNotification(postData.replyTo.postedBy);
            location.reload();
        }
        else{
            let html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            textbox.val("");
            button.prop("disabled", true);
        }
        
    })
});

$("#replyModal").on('show.bs.modal', (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id", postId);

    $.get("/api/posts/" + postId, results => {
        //console.log(results);
        outputPosts(results.postData, $("#originalPostContainer"));
    })
});

$("#replyModal").on('hidden.bs.modal', () => $("#originalPostContainer").html(""));

$("#deletePostModal").on('show.bs.modal', (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);
    $("#deletePostButton").data("id", postId);
});

$("#deletePostButton").click((event) => {
    let postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "DELETE",
        success: () => {
            
            location.reload();

            //console.log(postData.likes.length);

        }
    })

})

$("#filePhoto").change(function(){
    if(this.files && this.files[0]){
        let reader = new FileReader();
        reader.onload = (e) => {
            let img = document.getElementById("imagePreview");
            img.src = e.target.result;
        
            if(cropper !== undefined){
                cropper.destroy();
            }

            cropper = new Cropper(img, {
                aspectRatio: 1/1,
                background:false
            })

        }
        reader.readAsDataURL(this.files[0]);
    }
})

$("#coverPhoto").change(function(){
    if(this.files && this.files[0]){
        let reader = new FileReader();
        reader.onload = (e) => {
            let img = document.getElementById("coverPreview");
            img.src = e.target.result;
        
            if(cropper !== undefined){
                cropper.destroy();
            }

            cropper = new Cropper(img, {
                aspectRatio: 16 / 9,
                background:false
            })

        }
        reader.readAsDataURL(this.files[0]);
    }
})

$("#imageUploadModalButton").click(() =>{
    let canvas = cropper.getCroppedCanvas();

    if(canvas == null){
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

    canvas.toBlob((blob) =>{
        let formData = new FormData();
        formData.append("croppedImage", blob);
        
        $.ajax({
            url:"/api/users/profilePicture",
            type:"POST",
            data: formData,
            processData: false,
            contentType:false,
            success: () => location.reload()
        })
    });
})

$("#coverPhotoModalButton").click(() =>{
    let canvas = cropper.getCroppedCanvas();

    if(canvas == null){
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

    canvas.toBlob((blob) =>{
        let formData = new FormData();
        formData.append("croppedImage", blob);
        
        $.ajax({
            url:"/api/users/coverPhoto",
            type:"POST",
            data: formData,
            processData: false,
            contentType:false,
            success: () => location.reload()
        })
    });
})

$("#userSearchTextbox").keydown((event) => {
    clearTimeout(timer);
    let textbox = $(event.target);
    let value = textbox.val();

    if(value == "" && (event.which == 8 || event.keyCode == 8)){
        //remove user from selection
        selectedUsers.pop();
        updateSelectedUsersHtml();
        $(".resultsContainer").html("");

        if(selectedUsers.length == 0){
            $("#createChatButton").prop("disabled", true);
        }

        return;
    }

    timer = setTimeout(() => {
        value = textbox.val().trim();

        if(value == ""){
            $(".resultsContainer").html("");
        }
        else{
            searchUsers(value);
        }
    }, 500)
})

$("#createChatButton").click(() =>{
    let data = JSON.stringify(selectedUsers);

    $.post("/api/chats", {users: data}, chat => {

        if(!chat || !chat._id) return alert("Invalid");

        window.location.href = `/messages/${chat._id}`
    })
})

$(document).on("click", ".likeButton", (event) => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);
    
    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            
            button.find("span").text(postData.likes.length || "");

            if(postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active");
                emitNotification(postData.postedBy);
            }
            else {
                button.removeClass("active");
            }

            //console.log(postData.likes.length);

        }
    })

})

$(document).on("click", ".retweetButton", (event) => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);
    
    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: (postData) => {
            
            button.find("span").text(postData.retweetUsers.length || "");

            if(postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass("active");
                emitNotification(postData.postedBy);
            }
            else {
                button.removeClass("active");
            }

        }
    })

})

$(document).on("click", ".postClick", (event) => {
    let element = $(event.target);
    let postId = getPostIdFromElement(element);

    if(postId !== undefined && !element.is("button")) {
        window.location.href = '/tweet/' + postId;
    }
});

$(document).on("click", ".followButton", (event) => {

    let button = $(event.target);
    let userId = button.data().user;
    
    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => {

            if(xhr.status == 404){
                alert("User not found");
                return;
            }
            
            let count = 1;

            if(data.following && data.following.includes(userId)) {
                button.text("Following");
                button.addClass("following");
                emitNotification(userId);
            }
            else {
                button.text("Follow");
                button.removeClass("following");
                count = -1;
            }

            let followersCount = $("#FollowersValue");
            if (followersCount.length !=0){
                let followerstext = followersCount.text();
                followerstext = parseInt(followerstext);
                followersCount.text(followerstext + count);
            }

            //console.log(data);

        }
    })


});

$(document).on("click", ".notification.active", (e) => {
    let container = $(e.target);
    let notificationId = container.data().id;

    let href = container.attr("href");
    e.preventDefault();

    let callback = () => window.location = href;
    markNotificationsAsOpened(notificationId, callback);
})

function getPostIdFromElement(element){
    let isRoot = element.hasClass("post");
    let rootElement = isRoot == true ? element : element.closest(".post");
    let postId = rootElement.data().id;

    if(postId === undefined) return alert("Post id undefined");

    return postId;
}

function createPostHtml(postData, largeFont = false){

    if (postData == null) return alert("post data is null");

    let isretweet = postData.retweetData !== undefined;
    let retweetedBy = isretweet ? postData.postedBy.username : null;
    postData = isretweet ? postData.retweetData : postData;
    //console.log(isretweet);

    let postedBy = postData.postedBy;

    if(postedBy._id === undefined){
        return console.log("User object not populated");
    }

    let displayName = postedBy.firstName + " " + postedBy.lastName;
    let timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    let likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
    let retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
    let largeFontClass = largeFont ? "largeFont" : "";

    let retweetText = '';

    if(isretweet){
        retweetText = `<span><i class='fas fa-retweet'></i> <a class='space' href='/profile/${retweetedBy}'>@${retweetedBy} Retweeted</a></span>`
    }

    let replyFlag = "";
    if(postData.replyTo && postData.replyTo._id){

        if(!postData.replyTo._id){
            return alert("Reply to is not populates");
        }
        else if(!postData.replyTo.postedBy._id){
            return alert("Posted by is not populates");
        }

        let replyToUsername = postData.replyTo.postedBy.username;
        replyFlag = `<div class='replyFlag'>
                        <span>Replying to </span><a class='space' href='/profile/${replyToUsername}'>@${replyToUsername}</a>
                    </div>`
    }

    let buttons = "";
    if (postData.postedBy._id == userLoggedIn._id){
        buttons = `<button data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="#deletePostModal" ><i class="fas fa-trash"></i></button>`
    }

    return  `<div class="post ${largeFontClass}" data-id="${postData._id}">
                <div class='postActionContainer'>
                    ${retweetText}
                </div>
                <div class="mainContentContainer">
                    <div class="userImagecontainer">
                        <a href="/profile/${postedBy.username}">
                            <img src="${postedBy.profilePic}">
                        </a>
                    </div>
                    <div class = "postContentContainer">
                        <div class="postClick">
                            <div class = "header">
                                <a href="/profile/${postedBy.username}" class="displayName">${displayName}</a>
                                <span class="username">@${postedBy.username}</span>
                                <span class = "date"> ${timestamp}</span>
                                ${buttons}
                            </div>
                            ${replyFlag}
                            <div class = "postBody">
                            <span>${postData.content}</span>
                            </div>
                        </div>
                        <div class = "postFooter">
                            <div class="postButtonContainer">
                                <button class='commentButton' data-bs-toggle="modal" data-bs-target="#replyModal">
                                    <i class='far fa-comment'></i>
                                </button>
                            </div>
                            <div class="postButtonContainer green">
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class="postButtonContainer red">
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    let msPerMinute = 60 * 1000;
    let msPerHour = msPerMinute * 60;
    let msPerDay = msPerHour * 24;
    let msPerMonth = msPerDay * 30;
    let msPerYear = msPerDay * 365;

    let elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 <30) return "Just now";
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container){
    container.html("");

    if(!Array.isArray(results)){
        results = [results];
    }

    results.forEach(results => {
        let html = createPostHtml(results)
        container.append(html);
    });

    if(results.length == 0) {
        //container.append("<span class='noResults'> Nothing to show </span>")
    }
}

function outputPostsWithReplies(results, container){
    container.html("");

    if(results.replyTo !== undefined && results.replyTo._id !==undefined){
        let html = createPostHtml(results.replyTo);
        container.append(html);
    }

    let mainPosthtml = createPostHtml(results.postData, true);
    container.append(mainPosthtml);

    results.replies.forEach(results => {
        let html = createPostHtml(results)
        container.append(html);
    });

}

function outputUsers(results, container){
    container.html("");

    results.forEach(result => {
        let html = createUserHtml(result, true);
        container.append(html);
    });

    if(results.length == 0){
        container.append("<span class='noResults'>No results found</span>");
    }
}

function createUserHtml(userData, showFollowButton){

    let displayName = userData.firstName + " " + userData.lastName;
    let isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    let text = isFollowing ? "Following" : "Follow";
    let buttonclass = isFollowing ? "followButton following" : "followButton";

    let followButton = "";
    if(showFollowButton && userLoggedIn._id != userData._id){
        followButton = `<div class='followButtonContainer'>
                        <button class='${buttonclass}' data-user='${userData._id}'>${text}</button>
                        </div>
                        `
    }

    return `<div class="user">
                <div class="userImagecontainer">
                    <img src="${userData.profilePic}">
                </div>
                <div class="userdetailsContainer">
                    <div class="header">
                    <a href="/profile/${userData.username}" class="displayName">${displayName}</a>
                    <span class="username">@${userData.username}</span>
                    </div>
                </div>
                ${followButton}
            </div>
            `;
}

function searchUsers(searchTerm){
    $.get("/api/users", {search: searchTerm}, results => {
        outputSelectableUsers(results, $(".resultsContainer"));
    })
}

function outputSelectableUsers(results, container){
    container.html("");

    results.forEach(result => {

        if(result._id == userLoggedIn._id || selectedUsers.some(u => u._id == result._id )){
            return;
        }

        let html = createUserHtml(result, false);
        let element = $(html);
        element.click(() => userSelected(result))

        container.append(element);
    });

    if(results.length == 0){
        container.append("<span class='noResults'>No results found</span>");
    }
}

function userSelected(user) {
    selectedUsers.push(user);
    updateSelectedUsersHtml();
    $("#userSearchTextbox").val("").focus();
    $(".resultsContainer").html("");
    $("#createChatButton").prop("disabled", false);
}

function updateSelectedUsersHtml(){
    let elements = [];
    selectedUsers.forEach(user => {
        let name = user.firstName + " " + user.lastName;
        let userElement = $(`<span class='selectedUsers'>${name}</span>`);
        elements.push(userElement);
    })

    $(".selectedUsers").remove();
    $("#selectedUsers").prepend(elements);
}

function getChatName(chartData){
    let chatName = chartData.chatName;

    if(!chatName) {
        let otherChatUser = getOtherChatUser(chartData.users);
        let nameArray = otherChatUser.map(user => user.firstName + " " + user.lastName);
        
        chatName = nameArray.join(", ")
    }
    
    return chatName;
}

function getOtherChatUser(users){
    if(users.length == 1){
        return users;
    }
    
    return users.filter(user => user._id != userLoggedIn._id )
}

function messageReceived(newMessage) {
    if($(`[data-room="${newMessage.chat._id}"]`).length == 0) {
        showMessagePopup(newMessage);
    }
    else {
        addChatMessageHtml(newMessage);
    }
    refreshMessagesBadge();
}

function markNotificationsAsOpened(notificationId = null, callback = null) {
    if(callback == null) callback = () => location.reload();

    let url = notificationId != null ? `/api/notifications/${notificationId}/markAsOpened` : `/api/notifications/markAsOpened`;
    $.ajax({
        url: url,
        type: "PUT",
        success: () => callback()
    })
}

function refreshMessagesBadge() {
    $.get("/api/chats", { unreadOnly: true }, (data) => {
        
        let numResults = data.length;

        if(numResults > 0) {
            $("#messagesBadge").text(numResults).addClass("active");
        }
        else {
            $("#messagesBadge").text("").removeClass("active");
        }

    })
}

function refreshNotificationsBadge() {
    $.get("/api/notifications", { unreadOnly: true }, (data) => {
        
        let numResults = data.length;

        if(numResults > 0) {
            $("#notificationBadge").text(numResults).addClass("active");
        }
        else {
            $("#notificationBadge").text("").removeClass("active");
        }

    })
}

function showNotificationPopup(data) {
    let html = createNotificationHtml(data);
    let element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => element.fadeOut(400), 5000);
}

function showMessagePopup(data) {

    if(!data.chat.latestMessage._id) {
        data.chat.latestMessage = data;
    }

    let html = createChatHtml(data.chat);
    let element = $(html);
    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => element.fadeOut(400), 5000);
}

function outputNotificationList(notifications, container) {
    notifications.forEach(notification => {
        let html = createNotificationHtml(notification);
        container.append(html);
    })

    if(notifications.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>");
    }
}

function createNotificationHtml(notification) {
    let userFrom = notification.userFrom;
    let text = getNotificationText(notification);
    let symbol = getNotificationSymbol(notification);
    let href = getNotificationUrl(notification);
    let className = notification.opened ? "" : "active";

    return `<a href='${href}' class='resultListItem notification ${className}' data-id='${notification._id}'>
                <div class='resultsSymbolContainer'>
                ${symbol}
                </div>
                <div class='resultsImageContainer'>
                    <img src='${userFrom.profilePic}'>
                </div>
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='ellipsis'>${text}</span>
                </div>
            </a>`;
}

function getNotificationText(notification) {

    let userFrom = notification.userFrom;

    if(!userFrom.firstName || !userFrom.lastName) {
        return alert("user from data not populated");
    }

    let userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
    
    let text;

    if(notification.notificationType == "retweet") {
        text = `${userFromName} retweeted one of your tweets`;
    }
    else if(notification.notificationType == "tweetLike") {
        text = `${userFromName} liked one of your tweets`;
    }
    else if(notification.notificationType == "reply") {
        text = `${userFromName} replied to one of your tweets`;
    }
    else if(notification.notificationType == "follow") {
        text = `${userFromName} followed you`;
    }

    return `<span class='ellipsis'>${text}</span>`;
}

function getNotificationSymbol(notification) {

    let userFrom = notification.userFrom;

    if(!userFrom.firstName || !userFrom.lastName) {
        return alert("user from data not populated");
    }

    let symbol;

    if(notification.notificationType == "retweet") {
        symbol= `<span class="retweet"><i class="fas fa-retweet"></i></span>`;
    }
    else if(notification.notificationType == "tweetLike") {
        symbol= `<span class="heart"><i class="fas fa-heart"></i></span>`;
    }
    else if(notification.notificationType == "reply") {
        symbol= `<span class="comment"><i class="far fa-comment"></i></span>`;
    }
    else if(notification.notificationType == "follow") {
        symbol= `<span class="user"><i class="fas fa-user"></i></span>`;
    }

    return `${symbol}`;
}

function getNotificationUrl(notification) { 
    let url = "#";

    if(notification.notificationType == "retweet" || 
        notification.notificationType == "tweetLike" || 
        notification.notificationType == "reply") {
            
        url = `/tweet/${notification.entityId}`;
    }
    else if(notification.notificationType == "follow") {
        url = `/profile/${notification.entityId}`;
    }

    return url;
}

function createChatHtml(chartData){
    let chatName = getChatName(chartData);
    let image = getChatImageElements(chartData);
    let latestMessage = getLatestMessage(chartData.latestMessage);

    let activeClass = !chartData.latestMessage || chartData.latestMessage.readBy.includes(userLoggedIn._id) ? "" : "active";

    return `<a href='/messages/${chartData._id}' class='resultListItem ${activeClass}'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='chatHeading ellipsis'>${chatName}</span>
                    <span class='latestMessage ellipsis'>${latestMessage}</span>
                </div>
            </a>`
}

function getLatestMessage(latestMessage) {
    if(latestMessage != null) {
        let sender = latestMessage.sender;
        return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
    }

    return " ";
}

function getChatImageElements(chartData){

    let otherChatUser = getOtherChatUser(chartData.users);

    let groupChatClass = "";
    let chatImage = getUserChatImageElement(otherChatUser[0]);
    
    if(otherChatUser.length >1){
        groupChatClass = "groupChatImage";
        chatImage += getUserChatImageElement(otherChatUser[1]);
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`;
}

function getUserChatImageElement(user){
    if(!user || !user.profilePic){
        return alert("User passed into function is invalid");
    }

    return `<img src='${user.profilePic}' alt='User's ProfilePic'>`
}