export function isUsername(username) {
    if (username.length < 3 || username.length > 30) {
        return false;
    }
    const isValid = (char) => {
        return ((char >= "0" && char <= "9") ||
            (char >= "a" && char <= "z") ||
            (char >= "A" && char <= "Z") ||
            (char === "_"));
    };
    for (let i = 0; i < username.length; ++i) {
        if (!isValid(username[i])) {
            return false;
        }
    }
    return true;
}
export function isPassword(password) {
    if (password.length < 8 || password.length > 64) {
        return false;
    }
    const isNumber = (char) => char >= "0" && char <= "9";
    const isLower = (char) => char >= "a" && char <= "z";
    const isUpper = (char) => char >= "A" && char <= "Z";
    let containsNumber = false;
    let containsLower = false;
    let containsUpper = false;
    let containsSpecial = false;
    for (let i = 0; i < password.length; ++i) {
        const char = password[i];
        if (isNumber(char)) {
            containsNumber = true;
        }
        else if (isLower(char)) {
            containsLower = true;
        }
        else if (isUpper(char)) {
            containsUpper = true;
        }
        else {
            containsSpecial = true;
        }
    }
    return (containsNumber && containsLower && containsUpper && containsSpecial);
}
export function isHash(hash) {
    if (hash.length !== 64) {
        return false;
    }
    const isValid = (char) => {
        return ((char >= "0" && char <= "9") ||
            (char >= "a" && char <= "z") ||
            (char >= "A" && char <= "Z"));
    };
    for (let i = 0; i < hash.length; ++i) {
        if (!isValid(hash[i])) {
            return false;
        }
    }
    return true;
}
export function toHex(bytes) {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
export async function hash(key) {
    const bytes = (new TextEncoder()).encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
    return toHex(new Uint8Array(hashBuffer));
}
export function generateSalt() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return toHex(bytes);
}
