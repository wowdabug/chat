import { register, login } from "./auth";
import { Channel, channel } from "./channel";
import { getResponse } from "./response";

export { Channel };

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

        return getResponse(404);
	},
} satisfies ExportedHandler<Env>;
