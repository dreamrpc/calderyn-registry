// Events API — outfits, highlights, image uploads, admin moderation.
//
// Requires Cloudflare D1 binding: DB
// Requires Cloudflare R2 binding: MEDIA  (optional — URL-paste works without it)
// Requires env var: EVENTS_ADMIN_TOKEN  (for admin routes)
//
// Routes handled (all prefixed /api/):
//   GET  /api/events
//   GET  /api/events/:slug
//   PATCH /api/admin/events/:slug
//   GET  /api/events/:slug/outfits
//   POST /api/events/:slug/outfits
//   DELETE /api/events/:slug/outfits/:id
//   PATCH  /api/events/:slug/outfits/:id
//   GET  /api/events/:slug/highlights
//   POST /api/events/:slug/highlights
//   DELETE /api/events/:slug/highlights/:id
//   PATCH  /api/events/:slug/highlights/:id
//   POST /api/upload
//   GET  /api/image/* (R2 pass-through)

const MAX_CAPTION   = 120;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME  = new Set(['image/jpeg','image/png','image/gif','image/webp','image/avif']);

// ─── main entry ──────────────────────────────────────────────────────────────

export async function handleEvents(request, env, url) {
  const method   = request.method;
  const pathname = url.pathname; // already stripped of origin

  // R2 image serving (no DB required)
  if (method === 'GET' && pathname.startsWith('/api/image/')) {
    return serveImage(request, env, pathname.slice('/api/image/'.length));
  }

  // All other events endpoints require D1
  if (!env.DB) {
    return json({ error: 'events_not_configured',
      detail: 'D1 database not configured. Run wrangler d1 migrations apply.' }, 503);
  }

  // image upload
  if (pathname === '/api/upload' && method === 'POST') {
    return uploadImage(request, env);
  }

  // /api/events
  if (pathname === '/api/events') {
    if (method === 'GET') return listEvents(env);
    return json({ error: 'method_not_allowed' }, 405);
  }

  // /api/admin/events/:slug
  const adminMatch = pathname.match(/^\/api\/admin\/events\/([^/]+)$/);
  if (adminMatch && method === 'PATCH') {
    return updateEvent(request, env, adminMatch[1]);
  }

  // /api/events/:slug
  const eventMatch = pathname.match(/^\/api\/events\/([^/]+)$/);
  if (eventMatch) {
    if (method === 'GET') return getEvent(env, eventMatch[1]);
    return json({ error: 'method_not_allowed' }, 405);
  }

  // /api/events/:slug/outfits
  const outfitsMatch = pathname.match(/^\/api\/events\/([^/]+)\/outfits$/);
  if (outfitsMatch) {
    if (method === 'GET')  return listOutfits(env, outfitsMatch[1]);
    if (method === 'POST') return createOutfit(request, env, outfitsMatch[1]);
    return json({ error: 'method_not_allowed' }, 405);
  }

  // /api/events/:slug/outfits/:id
  const outfitIdMatch = pathname.match(/^\/api\/events\/([^/]+)\/outfits\/([^/]+)$/);
  if (outfitIdMatch) {
    if (method === 'DELETE') return deleteOutfit(request, env, outfitIdMatch[1], outfitIdMatch[2]);
    if (method === 'PATCH')  return patchOutfit(request, env, outfitIdMatch[1], outfitIdMatch[2]);
    return json({ error: 'method_not_allowed' }, 405);
  }

  // /api/events/:slug/highlights
  const highlightsMatch = pathname.match(/^\/api\/events\/([^/]+)\/highlights$/);
  if (highlightsMatch) {
    if (method === 'GET')  return listHighlights(env, highlightsMatch[1]);
    if (method === 'POST') return createHighlight(request, env, highlightsMatch[1]);
    return json({ error: 'method_not_allowed' }, 405);
  }

  // /api/events/:slug/highlights/:id
  const hlIdMatch = pathname.match(/^\/api\/events\/([^/]+)\/highlights\/([^/]+)$/);
  if (hlIdMatch) {
    if (method === 'DELETE') return deleteHighlight(request, env, hlIdMatch[1], hlIdMatch[2]);
    if (method === 'PATCH')  return patchHighlight(request, env, hlIdMatch[1], hlIdMatch[2]);
    return json({ error: 'method_not_allowed' }, 405);
  }

  return null; // not an events route — caller handles 404
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function uid() {
  return crypto.randomUUID().replace(/-/g, '');
}

function isAdmin(request, env) {
  const token = env.EVENTS_ADMIN_TOKEN;
  if (!token) return false;
  const auth = request.headers.get('authorization') || '';
  return auth === `Bearer ${token}`;
}

function writerId(request) {
  return (request.headers.get('x-writer-id') || '').slice(0, 64).trim();
}

function writerName(request) {
  return (request.headers.get('x-writer-name') || '').slice(0, 80).trim();
}

function deriveStatus(event) {
  if (event.status !== 'upcoming') return event.status;
  const now = Date.now();
  const start = new Date(event.date).getTime();
  if (now >= start && now < start + 3.5 * 60 * 60 * 1000) return 'live';
  if (now >= start + 3.5 * 60 * 60 * 1000) return 'past';
  return 'upcoming';
}

// ─── events ──────────────────────────────────────────────────────────────────

async function listEvents(env) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM events ORDER BY date DESC'
  ).all();
  const events = results.map(e => ({ ...e, status: deriveStatus(e) }));
  return json({ events });
}

async function getEvent(env, slug) {
  const event = await env.DB.prepare(
    'SELECT * FROM events WHERE slug = ?'
  ).bind(slug).first();
  if (!event) return json({ error: 'not_found' }, 404);
  return json({ event: { ...event, status: deriveStatus(event) } });
}

async function updateEvent(request, env, slug) {
  if (!isAdmin(request, env)) return json({ error: 'forbidden' }, 403);
  const body = await request.json().catch(() => ({}));
  const allowed = ['title','date','cover_image_url','blurb','status','outfits_cap','highlights_cap'];
  const sets = [];
  const vals = [];
  for (const k of allowed) {
    if (k in body) { sets.push(`${k} = ?`); vals.push(body[k]); }
  }
  if (!sets.length) return json({ error: 'no_fields' }, 400);
  vals.push(slug);
  await env.DB.prepare(`UPDATE events SET ${sets.join(', ')} WHERE slug = ?`)
    .bind(...vals).run();
  const event = await env.DB.prepare('SELECT * FROM events WHERE slug = ?').bind(slug).first();
  return json({ event });
}

// ─── outfits ─────────────────────────────────────────────────────────────────

async function listOutfits(env, slug) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM outfits
     WHERE event_slug = ? AND is_hidden = 0
     ORDER BY is_featured DESC, created_at ASC`
  ).bind(slug).all();
  return json({ outfits: results });
}

async function createOutfit(request, env, slug) {
  const event = await env.DB.prepare(
    'SELECT outfits_cap FROM events WHERE slug = ?'
  ).bind(slug).first();
  if (!event) return json({ error: 'event_not_found' }, 404);

  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'invalid_json' }, 400);

  const { category, character_name, image_url } = body;
  if (!category || !['cheer','powerball','other'].includes(category))
    return json({ error: 'invalid_category', detail: 'Must be cheer, powerball, or other.' }, 400);
  if (!character_name || !character_name.trim())
    return json({ error: 'character_name_required' }, 400);
  if (!image_url || !image_url.trim())
    return json({ error: 'image_url_required' }, 400);

  const wid  = writerId(request);
  const wname = writerName(request);
  if (!wid) return json({ error: 'writer_id_required' }, 400);

  // enforce per-writer cap
  const { count } = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM outfits WHERE event_slug = ? AND submitted_by = ? AND is_hidden = 0`
  ).bind(slug, wid).first();
  const cap = event.outfits_cap ?? 3;
  if (count >= cap)
    return json({ error: 'cap_reached', detail: `You've reached the outfit limit (${cap}) for this event.`, cap, used: count }, 429);

  const id = uid();
  await env.DB.prepare(
    `INSERT INTO outfits (id, event_slug, category, character_name, image_url, submitted_by, writer_name)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, slug, category, character_name.trim(), image_url.trim(), wid, wname || null).run();

  const outfit = await env.DB.prepare('SELECT * FROM outfits WHERE id = ?').bind(id).first();
  return json({ outfit }, 201);
}

async function deleteOutfit(request, env, slug, id) {
  const row = await env.DB.prepare(
    'SELECT * FROM outfits WHERE id = ? AND event_slug = ?'
  ).bind(id, slug).first();
  if (!row) return json({ error: 'not_found' }, 404);

  const admin = isAdmin(request, env);
  const wid   = writerId(request);
  if (!admin && row.submitted_by !== wid)
    return json({ error: 'forbidden', detail: 'You can only delete your own submissions.' }, 403);

  await env.DB.prepare('DELETE FROM outfits WHERE id = ?').bind(id).run();
  return json({ deleted: true });
}

async function patchOutfit(request, env, slug, id) {
  if (!isAdmin(request, env)) return json({ error: 'forbidden' }, 403);
  const body = await request.json().catch(() => ({}));
  const sets = []; const vals = [];
  if ('is_featured' in body) { sets.push('is_featured = ?'); vals.push(body.is_featured ? 1 : 0); }
  if ('is_hidden'   in body) { sets.push('is_hidden = ?');   vals.push(body.is_hidden   ? 1 : 0); }
  if (!sets.length) return json({ error: 'no_fields' }, 400);
  vals.push(id, slug);
  await env.DB.prepare(
    `UPDATE outfits SET ${sets.join(', ')} WHERE id = ? AND event_slug = ?`
  ).bind(...vals).run();
  const row = await env.DB.prepare('SELECT * FROM outfits WHERE id = ?').bind(id).first();
  return json({ outfit: row });
}

// admin-only: seed or replace host outfit
export async function seedHostOutfit(request, env, slug) {
  if (!isAdmin(request, env)) return json({ error: 'forbidden' }, 403);
  const body = await request.json().catch(() => null);
  if (!body?.image_url) return json({ error: 'image_url_required' }, 400);

  // Remove any existing host outfit for this event
  await env.DB.prepare(
    "DELETE FROM outfits WHERE event_slug = ? AND category = 'host'"
  ).bind(slug).run();

  const id = uid();
  await env.DB.prepare(
    `INSERT INTO outfits (id, event_slug, category, character_name, image_url, submitted_by, writer_name, is_featured)
     VALUES (?, ?, 'host', 'Stella Starkov', ?, 'admin', 'Admin', 1)`
  ).bind(id, slug, body.image_url.trim()).run();

  const outfit = await env.DB.prepare('SELECT * FROM outfits WHERE id = ?').bind(id).first();
  return json({ outfit }, 201);
}

// ─── highlights ───────────────────────────────────────────────────────────────

async function listHighlights(env, slug) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM highlights
     WHERE event_slug = ? AND is_hidden = 0
     ORDER BY is_pinned DESC, created_at DESC`
  ).bind(slug).all();
  return json({ highlights: results });
}

async function createHighlight(request, env, slug) {
  const event = await env.DB.prepare(
    'SELECT highlights_cap FROM events WHERE slug = ?'
  ).bind(slug).first();
  if (!event) return json({ error: 'event_not_found' }, 404);

  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'invalid_json' }, 400);

  const { character_name, caption, image_url } = body;
  if (!character_name || !character_name.trim())
    return json({ error: 'character_name_required' }, 400);
  if (!caption || !caption.trim())
    return json({ error: 'caption_required' }, 400);
  if (caption.trim().length > MAX_CAPTION)
    return json({ error: 'caption_too_long', detail: `Caption max ${MAX_CAPTION} chars.` }, 400);
  if (!image_url || !image_url.trim())
    return json({ error: 'image_url_required' }, 400);

  const wid   = writerId(request);
  const wname = writerName(request);
  if (!wid) return json({ error: 'writer_id_required' }, 400);

  // enforce 4-per-writer limit
  const { count } = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM highlights WHERE event_slug = ? AND submitted_by = ? AND is_hidden = 0`
  ).bind(slug, wid).first();
  const cap = event.highlights_cap ?? 4;
  if (count >= cap)
    return json({ error: 'cap_reached',
      detail: `You've used all ${cap} highlights for this event. Delete one to add another.`,
      cap, used: count }, 429);

  const id = uid();
  await env.DB.prepare(
    `INSERT INTO highlights (id, event_slug, character_name, caption, image_url, submitted_by, writer_name)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, slug, character_name.trim(), caption.trim(), image_url.trim(), wid, wname || null).run();

  const row = await env.DB.prepare('SELECT * FROM highlights WHERE id = ?').bind(id).first();
  return json({ highlight: row }, 201);
}

async function deleteHighlight(request, env, slug, id) {
  const row = await env.DB.prepare(
    'SELECT * FROM highlights WHERE id = ? AND event_slug = ?'
  ).bind(id, slug).first();
  if (!row) return json({ error: 'not_found' }, 404);

  const admin = isAdmin(request, env);
  const wid   = writerId(request);
  if (!admin && row.submitted_by !== wid)
    return json({ error: 'forbidden', detail: 'You can only delete your own submissions.' }, 403);

  await env.DB.prepare('DELETE FROM highlights WHERE id = ?').bind(id).run();
  return json({ deleted: true });
}

async function patchHighlight(request, env, slug, id) {
  if (!isAdmin(request, env)) return json({ error: 'forbidden' }, 403);
  const body = await request.json().catch(() => ({}));
  const sets = []; const vals = [];
  if ('is_pinned' in body) { sets.push('is_pinned = ?'); vals.push(body.is_pinned ? 1 : 0); }
  if ('is_hidden' in body) { sets.push('is_hidden = ?'); vals.push(body.is_hidden ? 1 : 0); }
  if (!sets.length) return json({ error: 'no_fields' }, 400);
  vals.push(id, slug);
  await env.DB.prepare(
    `UPDATE highlights SET ${sets.join(', ')} WHERE id = ? AND event_slug = ?`
  ).bind(...vals).run();
  const row = await env.DB.prepare('SELECT * FROM highlights WHERE id = ?').bind(id).first();
  return json({ highlight: row });
}

// ─── image upload / R2 ───────────────────────────────────────────────────────

async function uploadImage(request, env) {
  if (!env.MEDIA) {
    return json({ error: 'storage_not_configured',
      detail: 'R2 bucket not configured. Use image URL paste instead.' }, 503);
  }

  let formData;
  try { formData = await request.formData(); }
  catch { return json({ error: 'invalid_form_data' }, 400); }

  const file = formData.get('image');
  if (!file || typeof file === 'string') return json({ error: 'image_field_required' }, 400);

  if (!ALLOWED_MIME.has(file.type))
    return json({ error: 'invalid_file_type', detail: 'Accepted: JPEG, PNG, GIF, WebP, AVIF.' }, 400);

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_FILE_SIZE)
    return json({ error: 'file_too_large', detail: 'Max 8 MB.' }, 400);

  const slug    = (formData.get('event_slug') || 'general').slice(0, 60);
  const subtype = (formData.get('subtype') || 'upload').slice(0, 20);
  const ext     = file.type.split('/')[1].replace('jpeg','jpg');
  const key     = `events/${slug}/${subtype}/${uid()}.${ext}`;

  await env.MEDIA.put(key, bytes, { httpMetadata: { contentType: file.type } });

  // Serve via Worker: /api/image/{key}
  const imageUrl = `/api/image/${key}`;
  return json({ url: imageUrl }, 201);
}

async function serveImage(request, env, key) {
  if (!env.MEDIA) return new Response('Storage not configured', { status: 503 });
  if (!key) return new Response('Not found', { status: 404 });

  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('etag', obj.etag);

  if (request.headers.get('if-none-match') === obj.etag) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(obj.body, { headers });
}

// expose for direct admin route in index.js
export { seedHostOutfit as handleSeedHostOutfit };
