import { handleSubmit } from "./submit.js";
import { handleInteraction } from "./interactions.js";
import { handleQuotaStats } from "./quota-stats.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return preflight(env, request);
    }

    if (url.pathname === "/submit" && request.method === "POST") {
      return withCors(await handleSubmit(request, env, ctx), env, request);
    }

    if (url.pathname === "/quota-stats" && request.method === "POST") {
      return withCors(await handleQuotaStats(request, env, ctx), env, request);
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

function preflight(env, request) {
  const origin = pickAllowedOrigin(env, request);
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
      "vary": "origin",
    },
  });
}

function withCors(response, env, request) {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", pickAllowedOrigin(env, request));
  headers.append("vary", "origin");
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

// Pick the right access-control-allow-origin value. CORS_ALLOWED_ORIGINS
// is a comma-separated list; if the request's Origin matches an entry,
// echo it. Otherwise fall back to the first allow-listed origin so a
// browser blocks the request cleanly rather than mysteriously letting
// it through.
function pickAllowedOrigin(env, request) {
  const list = (env.CORS_ALLOWED_ORIGINS || env.CORS_ALLOWED_ORIGIN || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (list.length === 0) return "*";
  const origin = request?.headers.get("origin") || "";
  if (list.includes(origin)) return origin;
  return list[0];
}
