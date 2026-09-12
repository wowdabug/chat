"use strict";
const chatList = document.getElementById("chat-list");
function sendMessage(text) {
    chatList.innerHTML += text += "<br>";
}
function main() {
    for (let i = 0; i < 50; ++i)
        sendMessage("hello world");
}
main();
