const testBtn = document.getElementById("test");

if (!testBtn) {
    throw new Error();
}

function isUsername(username: string): boolean {
    if (username.length < 3 || username.length > 30) {
        return false;
    }

    const isValid = (char: string) => {
       return (
            (char >= "0" && char <= "9") ||
            (char >= "a" && char <= "z") ||
            (char >= "A" && char <= "Z") ||
            (char === "_" )
       );
    }

    for (let i = 0; i < username.length; ++i) {
        if (!isValid(username[i])) { 
            return false;
        }
    }

    return true;
}

function isPassword(password: string): boolean {
    if (password.length < 8 || password.length > 64) {
        return false;
    } 

    const isNumber = (char: string): boolean => char >= "0" && char <= "9";
    const isLower = (char: string): boolean => char >= "a" && char <= "z";
    const isUpper = (char: string): boolean => char >= "A" && char <= "Z";

    let containsNumber = false;
    let containsLower = false;
    let containsUpper = false;
    let containsSpecial = false;
    
    for (let i = 0; i < password.length; ++i) {
        const char = password[i];
        if (isNumber(char)) { 
            containsNumber = true;
        } else if (isLower(char)) {
            containsLower = true;
        } else if (isUpper(char)) {
            containsUpper = true;
        } else {
            containsSpecial = true;
        }
    }

    return (containsNumber && containsLower && containsUpper && containsSpecial);
}

function toHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

async function hash(key: string): Promise<string> {
    const bytes = (new TextEncoder()).encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
    return toHex(new Uint8Array(hashBuffer));
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

    const postData = postResponse;
    console.log(postData);
}

testBtn.addEventListener("click", (event) => {
    register();
})
