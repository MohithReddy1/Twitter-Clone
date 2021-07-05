$(document).ready(() => {
    $.get("/api/notifications", (data) => {
        outputNotificationList(data, $(".resultsContainer"));
    })
});

$("#markNotificationsAsRead").click(() => markNotificationsAsOpened());
