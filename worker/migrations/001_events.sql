-- Events hub schema for Calderyn College
-- Apply with: wrangler d1 migrations apply calderyn-events --remote

CREATE TABLE IF NOT EXISTS events (
  id            TEXT    PRIMARY KEY,
  slug          TEXT    UNIQUE NOT NULL,
  title         TEXT    NOT NULL,
  date          TEXT    NOT NULL,           -- ISO-8601 UTC
  cover_image_url TEXT,
  blurb         TEXT,
  status        TEXT    NOT NULL DEFAULT 'upcoming', -- upcoming | live | past
  outfits_cap   INTEGER NOT NULL DEFAULT 3,
  highlights_cap INTEGER NOT NULL DEFAULT 4,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS outfits (
  id            TEXT    PRIMARY KEY,
  event_slug    TEXT    NOT NULL REFERENCES events(slug) ON DELETE CASCADE,
  category      TEXT    NOT NULL CHECK (category IN ('host','cheer','powerball','other')),
  character_name TEXT   NOT NULL,
  image_url     TEXT    NOT NULL,
  submitted_by  TEXT    NOT NULL,  -- localStorage writer UUID
  writer_name   TEXT,
  is_featured   INTEGER NOT NULL DEFAULT 0,
  is_hidden     INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS highlights (
  id            TEXT    PRIMARY KEY,
  event_slug    TEXT    NOT NULL REFERENCES events(slug) ON DELETE CASCADE,
  character_name TEXT   NOT NULL,
  caption       TEXT    NOT NULL,
  image_url     TEXT    NOT NULL,
  submitted_by  TEXT    NOT NULL,  -- localStorage writer UUID
  writer_name   TEXT,
  is_pinned     INTEGER NOT NULL DEFAULT 0,
  is_hidden     INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_outfits_event   ON outfits(event_slug, is_hidden);
CREATE INDEX IF NOT EXISTS idx_outfits_writer  ON outfits(event_slug, submitted_by);
CREATE INDEX IF NOT EXISTS idx_highlights_event  ON highlights(event_slug, is_hidden);
CREATE INDEX IF NOT EXISTS idx_highlights_writer ON highlights(event_slug, submitted_by);

-- Seed the charity fair event
INSERT OR IGNORE INTO events (id, slug, title, date, blurb, status)
VALUES (
  'evt_charity_fair_2026',
  'charity-fair',
  'Great Ormond Street Hospital Charity Fair',
  '2026-06-14T16:00:00Z',
  'Red-carpet arrival, atrium fair, D20 games where you''re partnered with a child from the wards to win prizes for them, a 7:30 PM cheer performance, ward visits, and an 8:30 PM wind down.',
  'upcoming'
);
