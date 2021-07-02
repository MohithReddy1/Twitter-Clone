$(document).ready(() => {
    $.get("/api/chats", (data, status, xhr) => {
        if(xhr.status == 400){
            alert("Could not get chat list");
        }
        else{
            outputChatList(data, $(".resultsContainer"));
        }
    })
})

function outputChatList(chatList, container){
    chatList.forEach(chat => {
        let html = createChatHtml(chat);
        container.append(html);
    });

    if(chatList.length == 0){
        container.append("<span class='noResults'>Nothing to show</span>");
    }
}

function createChatHtml(chartData){
    let chatName = getChatName(chartData);
    let image = getChatImageElements(chartData);
    let latestMessage = getLatestMessage(chartData.latestMessage);

    return `<a href='/messages/${chartData._id}' class='resultListItem'>
                ${image}
                <div class='resultsDetailsContainer ellipsis'>
                    <span class='chatHeading ellipsis'>${chatName}</span>
                    <span class='latestMessage ellipsis'>${latestMessage}</span>
                </div>
            </a>`
}

function getLatestMessage(latestMessage) {
    if(latestMessage != null) {
        var sender = latestMessage.sender;
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