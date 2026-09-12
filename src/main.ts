const chatList = document.getElementById("chat-list")!;

function sendMessage(text: string): void {
    chatList.innerHTML += text += "<br>";
}

function main(): void {
    for (let i: number = 0; i < 50; ++i)  sendMessage("hello world");
}

main();
