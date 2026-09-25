import { DurableObject } from "cloudflare:workers";

export class Channel extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async sayHello(name: string): Promise<string> {
		return `Hello, ${name}!`;
	}
}

async function login(request: Request, env: Env): Promise<Response> {
    return new Response("No Content", { status: 204 });
}

async function register(request: Request, env: Env): Promise<Response> {
    return new Response("No Content", { status: 204 });
}

async function verify(request: Request, env: Env): Promise<Response> {
    return new Response("No Content", { status: 204 });
}

async function channel(request: Request, env: Env): Promise<Response> {
    return new Response("No Content", { status: 204 });
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

		const stub = env.CHANNEL.getByName("general");

		const greeting = await stub.sayHello("world");

		return new Response(greeting);
	},
} satisfies ExportedHandler<Env>;
