import { Event } from "../../shared/main";
import { getResponse } from "./response";

import { DurableObject } from "cloudflare:workers";

export class Channel extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
    }

    async sayHello(name: string): Promise<string> {
        return `Hello, ${name}!`;
    }
}

export async function channel(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const parts = url.pathname.split("/");

    if (parts.length !== 3) {
        console.error("invalid fetch url");
        return getResponse(500);
    }

    const channelName = parts[2];
    console.log(channelName);

    const stub = env.CHANNEL.getByName(channelName);


    return getResponse(204);
}
