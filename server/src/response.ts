export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true"
};

export function getResponse(statusCode: number): Response {
    return new Response(null, {
        status: statusCode,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
        },
    });
}
