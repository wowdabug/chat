import { DurableObject } from "cloudflare:workers";

import { isUsername, isHash, hash, generateSalt } from "../../shared/main";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function getResponse<T extends BodyInit | null | undefined>(body: T, status: number): Response {
    return new Response(body, {
        status: status,
        headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
        },
    });
}

export class Channel extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async sayHello(name: string): Promise<string> {
		return `Hello, ${name}!`;
	}
}

async function register(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
        return getResponse("Invalid Method", 400);
    }    

    let json: unknown;

    try {
        json = await request.json();
    } catch {
        return getResponse("Invalid JSON", 400);
    }

    if (
        typeof json !== "object" ||
        json === null ||
        Array.isArray(json)
    ) {
        return getResponse("Invalid JSON", 400);
    }

    const { username, password } = json as Record<string, unknown>;

    if (
        typeof username !== "string" || 
        typeof password !== "string" ||
        !isUsername(username) || 
        !isHash(password)
    ) {
        return getResponse("Invalid Data", 400);
    }

    const hasUser = await env.chat
        .prepare("SELECT id FROM users WHERE username = ?")
        .bind(username)
        .first();

    if (hasUser) {
        return getResponse("User Conflict", 409);
    }

    const salt = generateSalt();
    const passwordHash = await hash(password + salt + env.PEPPER)

    await env.chat
        .prepare("INSERT INTO users (username, password_hash, password_salt) VALUES (?, ?, ?)")
        .bind(username, passwordHash, salt)
        .run();

    return getResponse(null, 204);
}

async function login(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
        return new Response("Invalid Method", { status: 400 });
    }  

    return getResponse(null, 204);
}

async function channel(request: Request, env: Env): Promise<Response> {
    return getResponse(null, 204);
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
        if (request.method === "OPTIONS") {
            return getResponse(null, 204);
        }

        const url = new URL(request.url);

        if (url.pathname === "/login") {
            return login(request, env);
        } 

        if (url.pathname === "/register") {
            return register(request, env);
        }

        if (url.pathname.startsWith("/channel/")) {
            return channel(request, env);
        }

        return new Response("Not Found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
