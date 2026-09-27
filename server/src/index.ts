import { DurableObject } from "cloudflare:workers";

import validator from "validator";
import { Resend } from "resend";

export class Channel extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async sayHello(name: string): Promise<string> {
		return `Hello, ${name}!`;
	}
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

function isEmail(email: string): boolean {
    return validator.isEmail(email);
}

// function isPassword(password: string): boolean {
//     if (password.length < 8 || password.length > 64) {
//         return false;
//     } 

//     const isNumber = (char: string): boolean => char >= "0" && char <= "9";
//     const isLower = (char: string): boolean => char >= "a" && char <= "z";
//     const isUpper = (char: string): boolean => char >= "A" && char <= "Z";

//     let containsNumber = false;
//     let containsLower = false;
//     let containsUpper = false;
//     let containsSpecial = false;
    
//     for (let i = 0; i < password.length; ++i) {
//         const char = password[i];
//         if (isNumber(char)) { 
//             containsNumber = true;
//         } else if (isLower(char)) {
//             containsLower = true;
//         } else if (isUpper(char)) {
//             containsUpper = true;
//         } else {
//             containsSpecial = true;
//         }
//     }

//     return (containsNumber && containsLower && containsUpper && containsSpecial);
// }

function isHash(hash: string): boolean {
    if (hash.length !== 64) {
        return false;
    }

    const isValid = (char: string) => {
       return (
            (char >= "0" && char <= "9") ||
            (char >= "a" && char <= "z") ||
            (char >= "A" && char <= "Z")
       );
    }

    for (let i = 0; i < hash.length; ++i) {
        if (!isValid(hash[i])) { 
            return false;
        }
    }

    return true;
}

async function login(request: Request, env: Env): Promise<Response> {
    return new Response("No Content", { status: 204 });
}

function toHex(bytes: Uint8Array) {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

function getToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return toHex(bytes);
}

async function hash(key: string): Promise<string> {
    const bytes = (new TextEncoder()).encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
    return toHex(new Uint8Array(hashBuffer));
}

async function sendEmail(env: Env, username: string, email: string, token: string): Promise<boolean> {
    const resend = new Resend(env.RESEND_KEY);

    try {
        const data = resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Hello World',
            text: `Hello ${username}!`
        });
    } catch {
        return false;
    }

    return true;
}

async function register(request: Request, env: Env): Promise<Response> {
    let json: unknown;

    try {
        json = await request.json();
    } catch {
        return new Response("Bad Request", { status: 400 });
    }

    if (
        typeof json !== "object" ||
        json === null ||
        Array.isArray(json)
    ) {
        return new Response("Invalid JSON", { status: 400 });
    }

    const { username, email, clientHash } = json as Record<string, unknown>;

    if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof clientHash !== "string"
    ) {
        return new Response("Not String", { status: 400 });
    }

    if (
        !isUsername(username) || 
        !isEmail(email) || 
        !isHash(clientHash)
    ) {
        return new Response("Invalid Registration Data", { status: 400 });
    }

    const hasUser = await env.chat
        .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
        .bind(username, email)
        .first();

    if (hasUser) {
        return new Response("Conflict", { status: 409 });
    }

    const serverHash = await hash(clientHash + env.PEPPER)

    await env.chat
        .prepare("INSERT INTO users (username, email, password_hash, verified) VALUES (?, ?, ?, ?)")
        .bind(username, email, serverHash, 0)
        .run();

    const status = await sendEmail(env, username, email, getToken());
    if (!status) {
        return new Response("Email Failed", { status: 400 });
    }

    return new Response(null, { status: 204 });
}

async function verify(request: Request, env: Env): Promise<Response> {
    return new Response("No Content", { status: 204 });
}

async function channel(request: Request, env: Env): Promise<Response> {
    return new Response("No Content", { status: 204 });

    // const stub = env.CHANNEL.getByName("general");
    // const greeting = await stub.sayHello("world");
    // return new Response(greeting);
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === "/login") {
            return login(request, env);
        } 

        if (url.pathname === "/register") {
            return register(request, env);
        }
        
        if (url.pathname === "/verify") {
            return verify(request, env);
        }

        if (url.pathname.startsWith("/channel/")) {
            return channel(request, env);
        }

        return new Response("Not Found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
