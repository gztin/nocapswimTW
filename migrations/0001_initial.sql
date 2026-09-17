CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  region TEXT NOT NULL CHECK (region IN ('north', 'central', 'south', 'east', 'islands')),
  address TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  cap_policy TEXT NOT NULL CHECK (cap_policy IN ('not-required', 'conditional', 'unknown')),
  restrictions TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('official', 'phone', 'onsite', 'community')),
  source_url TEXT,
  last_verified TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new-location', 'policy-change', 'address-error', 'other')),
  location_id TEXT,
  name TEXT,
  city TEXT,
  district TEXT,
  region TEXT CHECK (region IS NULL OR region IN ('north', 'central', 'south', 'east', 'islands')),
  address TEXT,
  latitude REAL,
  longitude REAL,
  cap_policy TEXT CHECK (cap_policy IS NULL OR cap_policy IN ('not-required', 'conditional', 'unknown')),
  restrictions TEXT,
  source_type TEXT CHECK (source_type IS NULL OR source_type IN ('official', 'phone', 'onsite', 'community')),
  source_url TEXT,
  notes TEXT,
  nickname TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_status_created_at
  ON submissions (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_location_id
  ON submissions (location_id);
