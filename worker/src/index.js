import { handleSubmit } from "./submit.js";
import { handleInteraction } from "./interactions.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return preflight(env);
    }

    if (url.pathname === "/submit" && request.method === "POST") {
      return withCors(await handleSubmit(request, env, ctx), env);
    }

    if (url.pathname === "/interactions" && request.method === "POST") {
      return handleInteraction(request, env, ctx);
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response("calderyn-registry-relay ok", {
        headers: { "content-type": "text/plain" },
      });
    }

    return new Response("not found", { status: 404 });
  },
};

function preflight(env) {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": env.CORS_ALLOWED_ORIGIN || "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
    },
  });
}

function withCors(response, env) {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", env.CORS_ALLOWED_ORIGIN || "*");
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
