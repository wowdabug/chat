import { register, login } from "./auth";
import { Channel, channel } from "./channel";
import { getResponse } from "./response";

export { Channel };

export default {
	async fetch(request, env, ctx): Promise<Response> {
        const start = performance.now();

        if (request.method === "OPTIONS") {
            return getResponse(200);
        }

        const url = new URL(request.url);

        if (url.pathname === "/login" && request.method === "POST") {
            console.log(`Finished in ${performance.now() - start} ms`);
            return login(request, env);
        } 

        if (url.pathname === "/register" && request.method === "POST") {
            console.log(`Finished in ${performance.now() - start} ms`);
            return register(request, env);
        }

        if (url.pathname.startsWith("/channel/") && request.method === "POST") {
            console.log(`Finished in ${performance.now() - start} ms`);
            return channel(request, env);
        }

        return getResponse(404);
	},
} satisfies ExportedHandler<Env>;
