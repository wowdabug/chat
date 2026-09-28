import { DurableObject } from "cloudflare:workers";

import { register, login } from "./auth";
import { getResponse } from "./response";

export class Channel extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async sayHello(name: string): Promise<string> {
		return `Hello, ${name}!`;
	}
}

async function channel(request: Request, env: Env): Promise<Response> {
    return getResponse(204);
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
        if (request.method === "OPTIONS") {
            return getResponse(204);
        }

        const url = new URL(request.url);

        if (url.pathname === "/login" && request.method === "POST") {
            return login(request, env);
        } 

        if (url.pathname === "/register" && request.method === "POST") {
            return register(request, env);
        }

        if (url.pathname.startsWith("/channel/")) {
            return channel(request, env);
        }

        return new Response("Not Found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
