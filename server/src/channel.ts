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
    return getResponse(204);
}
