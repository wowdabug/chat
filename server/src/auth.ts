import { isUsername, isHash, hash, generateToken } from "../../shared/main";
import { corsHeaders, getResponse } from "./response";

type Info = {
    username: string;
    password: string;
};

async function getInfo(request: Request): Promise<Info | null> {
    let json: unknown;

    try {
        json = await request.json();
    } catch {
        console.error("invalid json");
        return null;
    }

    if (
        typeof json !== "object" ||
        json === null ||
        Array.isArray(json)
    ) {
        console.log("json not object");
        return null;
    }

    const { username, password } = json as Record<string, unknown>;

    if (
        typeof username !== "string" || 
        typeof password !== "string" ||
        !isUsername(username) || 
        !isHash(password)
    ) {
        console.error("invalid username or password");
        return null;
    }

    return { username, password };
}

export async function register(request: Request, env: Env): Promise<Response> {
    const info = await getInfo(request);

    if (!info) {
        return getResponse(400);
    }

    const { username, password } = info;

    const hasUser = await env.chat
        .prepare("SELECT id FROM users WHERE username = ?")
        .bind(username)
        .first();

    if (hasUser) {
        console.error("username taken");
        return getResponse(409);
    }

    const passwordSalt = generateToken();
    const passwordHash = await hash(password + passwordSalt + env.PEPPER)

    await env.chat
        .prepare("INSERT INTO users (username, password_hash, password_salt) VALUES (?, ?, ?)")
        .bind(username, passwordHash, passwordSalt)
        .run();

    console.log("registered new user");
    return getResponse(204);
}

export async function login(request: Request, env: Env): Promise<Response> {
    const info = await getInfo(request);

    if (!info) {
        return getResponse(400);
    }

    const { username, password } = info;

    const user = await env.chat
        .prepare("SELECT id, username, password_hash, password_salt FROM users WHERE username = ?")
        .bind(username)
        .first<Record<string, unknown>>();

    if (!user) {
        console.error("user not found");
        return getResponse(401);
    }

    const { 
        id: id, 
        password_hash: passwordHash, 
        password_salt: passwordSalt 
    } = user;

    const clientPasswordHash = await hash(password + passwordSalt + env.PEPPER);
    if (clientPasswordHash !== passwordHash) {
        console.error("incorrect password");
        return getResponse(401);
    }

    const token = generateToken();
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);

    await env.chat
        .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
        .bind(token, id, expiresAt)
        .run();

    console.log("logged in");
    return new Response(null, { 
        status: 204,
        headers: {
            ...corsHeaders,
            "Set-Cookie": `token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
        } 
    })
}
