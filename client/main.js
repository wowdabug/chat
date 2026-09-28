import { hash } from "../shared/main.js";
const testBtn = document.getElementById("test");
if (!testBtn) {
    throw new Error();
}
async function register() {
    const username = "test";
    const password = "obunga!fre1234";
    const passwordHash = await hash(password);
    const postResponse = await fetch('http://127.0.0.1:8787/register', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: passwordHash }),
    });
    console.log(username);
    console.log(password);
    console.log(passwordHash);
    const postData = await postResponse.text();
    console.log(postData);
}
async function login() {
    const username = "test";
    const password = "obunga!fre234";
    const passwordHash = await hash(password);
    const postResponse = await fetch('http://127.0.0.1:8787/login', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: passwordHash }),
    });
    console.log(username);
    console.log(password);
    console.log(passwordHash);
    const postData = await postResponse.text();
    console.log(postData);
}
testBtn.addEventListener("click", (event) => {
    channel();
});
async function channel() {
    const message = "hello world";
    const postResponse = await fetch('http://127.0.0.1:8787/channel/amongus', {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
    });
}
