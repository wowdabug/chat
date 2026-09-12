"use strict";
const chatList = document.getElementById("chat-list");
function sendMessage(profile, info, text) {
    const message = document.createElement("div");
    message.className = "message";
    const messageProfile = document.createElement("img");
    messageProfile.src = profile;
    messageProfile.className = "message-profile";
    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    const messageInfo = document.createElement("div");
    messageInfo.textContent = info;
    messageInfo.className = "message-info";
    const messageText = document.createElement("div");
    messageText.textContent = text;
    messageText.className = "message-text";
    messageContent.appendChild(messageInfo);
    messageContent.appendChild(messageText);
    message.appendChild(messageProfile);
    message.appendChild(messageContent);
    chatList.appendChild(message);
}
function main() {
    for (let i = 0; i < 50; ++i) {
        sendMessage("https://picsum.photos/200", "John", "hello world\nhhhhh<br>fwe");
    }
}
main();
