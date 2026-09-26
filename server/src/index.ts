import { DurableObject } from "cloudflare:workers";

import validator from 'validator';
//import crypto from 'crypto';

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

async function login(request: Request, env: Env): Promise<Response> {
    return new Response("No Content", { status: 204 });
}

async function hashPassword(password: string, salt: string): string {
    return "";
}

async function generateSalt(): string {
    return "";
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
        return new Response("Bad Request", { status: 400 });
    }

    const { username, email, password } = json as Record<string, unknown>;

    if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
    ) {
        return new Response("Bad Request", { status: 400 });
    }

    if (
        !isUsername(username) || 
        !isEmail(email) || 
        !isPassword(password)
    ) {
        return new Response("Bad Request", { status: 400 });
    }

    const hasUser = await env.chat
        .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
        .bind(username, email)
        .first();

    if (hasUser) {
        return new Response("No Content", { status: 409 });
    }

    env.chat
        .prepare("INSERT INTO users (username, email, password_hash, verified) VALUES (?, ?, ?, ?)")
        .bind()
}

async function verify(request: Request, env: Env): Promise<Response> {
    return new Response("No Content", { status: 204 });
}

async function channel(request: Request, env: Env): Promise<Response> {
    return new Response("No Content", { status: 204 });
}

// const stub = env.CHANNEL.getByName("general");
// const greeting = await stub.sayHello("world");
// return new Response(greeting);

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
