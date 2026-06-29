INSERT INTO users (id, username, password_hash, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2b$10$rHWE0Flx5XIF.FSfGO22SOIEn.7FopzqypwKFuEuXRs/edbE8NrT.',
  'active',
  NOW(),
  NOW()
);
