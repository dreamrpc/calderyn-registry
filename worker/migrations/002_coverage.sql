CREATE TABLE IF NOT EXISTS coverage_posts (
  id          TEXT PRIMARY KEY,
  event_id    INTEGER NOT NULL REFERENCES events(id),
  writer_tag  TEXT NOT NULL,
  character_name TEXT NOT NULL,
  icon_url    TEXT NOT NULL,
  scene_url   TEXT NOT NULL,
  comment     TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  is_hidden   INTEGER NOT NULL DEFAULT 0,
  is_pinned   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_coverage_event ON coverage_posts(event_id, is_hidden, created_at);
CREATE INDEX IF NOT EXISTS idx_coverage_writer ON coverage_posts(submitted_by, event_id);
