function toHex(bytes) {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

async function hash(key) {
    const bytes = (new TextEncoder()).encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
    return toHex(new Uint8Array(hashBuffer));
}

async function main() {
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

main();


