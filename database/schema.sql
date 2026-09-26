CREATE TABLE IF NOT EXISTS site_content (
  id smallint PRIMARY KEY CHECK (id = 1),
  content jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_credentials (
  id smallint PRIMARY KEY CHECK (id = 1),
  username text NOT NULL UNIQUE,
  password_salt bytea NOT NULL,
  password_hash bytea NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
