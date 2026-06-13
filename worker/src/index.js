import { handleSubmit } from "./submit.js";
import { handleInteraction } from "./interactions.js";
import { handleQuotaStats } from "./quota-stats.js";
import { handleWriterTags } from "./writer-tags.js";
import { handleStatus } from "./status.js";
import { handleEvents, handleSeedHostOutfit } from "./events.js";

export default {
  async fetch(request, env, ctx) {
    try {
      return await route(request, env, ctx);
    } catch (err) {
      // Belt-and-suspenders. Without this, a thrown error inside any
      // handler escaped to Cloudflare's default 5xx page, which has no
      // CORS headers — so the browser reported "Failed to fetch" (CORS
      // preflight-style) and admins had no idea the Worker had actually
      // crashed. Wrap any uncaught throw in a JSON 500 + CORS headers
      // so the failure mode is visible at the network layer.
      console.error("worker dispatch failed:", err && err.stack || err);
      const body = JSON.stringify({
        error: "internal_error",
        detail: String(err && err.message || err).slice(0, 400),
      });
      const headers = new Headers({ "content-type": "application/json" });
      headers.set("access-control-allow-origin", pickAllowedOrigin(env, request));
      headers.append("vary", "origin");
      return new Response(body, { status: 500, headers });
    }
  },
};

async function route(request, env, ctx) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return preflight(env, request);
  }

  // ─── events API ────────────────────────────────────────────────
  // Admin host-outfit seed: PATCH /api/admin/events/:slug/host-outfit
  const hostOutfitMatch = url.pathname.match(/^\/api\/admin\/events\/([^/]+)\/host-outfit$/);
  if (hostOutfitMatch && request.method === "PATCH") {
    return withCors(await handleSeedHostOutfit(request, env, hostOutfitMatch[1]), env, request);
  }

  // All other /api/events and /api/upload and /api/image routes
  if (url.pathname.startsWith("/api/")) {
    const result = await handleEvents(request, env, url);
    if (result) return withCors(result, env, request);
    // fall through to 404 below
  }

  // ─── existing routes ────────────────────────────────────────────
  if (url.pathname === "/submit" && request.method === "POST") {
    return withCors(await handleSubmit(request, env, ctx), env, request);
  }

  if (url.pathname === "/quota-stats" && request.method === "POST") {
    return withCors(await handleQuotaStats(request, env, ctx), env, request);
  }

  if (url.pathname === "/writer-tags" && request.method === "GET") {
    return withCors(await handleWriterTags(request, env, ctx), env, request);
  }

  if (url.pathname === "/status" && request.method === "GET") {
    return withCors(await handleStatus(request, env, ctx), env, request);
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
}

function preflight(env, request) {
  const origin = pickAllowedOrigin(env, request);
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "access-control-allow-headers": "content-type, authorization, x-writer-id, x-writer-name",
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
