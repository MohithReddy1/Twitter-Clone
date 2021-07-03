let typing = false;
let lastTypingTime;

$(document).ready(() =>{

    socket.emit("join room", chatId);
    socket.on("typing", () => $(".typingDots").show());
    socket.on("stop typing", () => $(".typingDots").hide());

    $.get(`/api/chats/${chatId}`, (data) => {
        $("#chatName").text(getChatName(data));
    })

    $.get(`/api/chats/${chatId}/messages`, (data) =>{
        
        let messages = [];
        let lastSenderId = "";

        data.forEach((message, index) => {
            let html = createMessageHtml(message, data[index+1], lastSenderId);
            messages.push(html);

            lastSenderId = message.sender._id;
        });

        let messagesHtml = messages.join("");

        addMessagesHtmlToPage(messagesHtml);
        scrollToBottom(false);

        $(".loadingSpinnerContainer").remove();
        $(".chatContainer").css("visibility", "visible");
    })
})

$("#chatNameButton").click(() => {
    let name = $("#chatNameTextBox").val().trim();
    
    $.ajax({
        url: `/api/chats/`+ chatId,
        type: "PUT",
        data: { chatName: name },
        success: (data, status, xhr) => {
            if(xhr.status != 204) {
                alert("could not update");
            }
            else {
                location.reload();
            }
        }
    })
})

$(".sendMessageButton").click(() => {
    messageSubmitted();
})

$(".inputTextBox").keydown((event) => {

    updateTyping();

    //if(event.which === 13 && !event.shiftKey){
    if(event.which === 13){
        messageSubmitted();
        return false;
    }
})

function updateTyping(){
    if(!connected) return;

    if(!typing) {
        typing = true;
        socket.emit("typing", chatId);
    }

    lastTypingTime = new Date().getTime();
    let timerLength = 3000;

    setTimeout(() => {
        let timeNow = new Date().getTime();
        let timeDiff = timeNow - lastTypingTime;

        if(timeDiff >= timerLength && typing) {
            socket.emit("stop typing", chatId);
            typing = false;
        }
    }, timerLength);
}

function addMessagesHtmlToPage(html){
    $(".chatMessages").append(html);
}

function messageSubmitted(){
    let content = $(".inputTextBox").val().trim();

    if(content != ""){
        sendMessage(content);
        $(".inputTextBox").val("");
        socket.emit("stop typing", chatId);
        typing = false;
    }
}

function sendMessage(content){
    $.post("/api/messages", { content: content, chatId: chatId }, (data, status, xhr) => {
        
        if(xhr.status != 201){
            alert("Could not send message");
            $(".inputTextBox").val(content);
            return;
        }
        
        addChatMessageHtml(data);

        if(connected) {
            socket.emit("new message", data);
        }
        
    })
}

function addChatMessageHtml(message){
    if(!message || !message._id){
        alert("Message is not valid");
        return;
    }

    let messageDiv = createMessageHtml(message, null, "");

    addMessagesHtmlToPage(messageDiv);
    scrollToBottom(true);
}

function createMessageHtml(message, nextMessage, lastSenderId){

    let sender = message.sender;
    let senderName = sender.firstName + " " + sender.lastName;

    let currentSenderId = sender._id;
    let nextSenderId = nextMessage != null ? nextMessage.sender._id : "";

    let isFirst = lastSenderId != currentSenderId;
    let isLast = nextSenderId != currentSenderId;

    let isMine = message.sender._id == userLoggedIn._id;
    let liClassName = isMine ? "mine" : "others";

    let nameElement = "";

    if(isFirst){
        liClassName += " first";

        if(!isMine){
            nameElement = `<span class='senderName'>${senderName}</span>`;
        }
    }

    let profileImage = "";
    if(isLast) {
        liClassName += " last";
        profileImage = `<img src='${sender.profilePic}'>`;
    }

    let imageContainer = "";
    if(!isMine) {
        imageContainer = `<div class='imageContainer'>
                                ${profileImage}
                            </div>`;
    }

    return `<li class='message ${liClassName}'>
                ${imageContainer}
                <div class='messageContainer'>
                    ${nameElement}
                    <span class='messageBody'>
                        ${message.content}
                    </span>
                </div>
            </li>`;
}

function scrollToBottom(animated){
    let container = $(".chatMessages");
    let scrollHeight = container[0].scrollHeight;

    if(animated){
        container.animate({ scrollTop: scrollHeight}, "slow");
    }
    else{
        container.scrollTop(scrollHeight);
    }
}