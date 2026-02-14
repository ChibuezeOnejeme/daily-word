
-- Remove all existing bible verses (we'll re-seed fresh)
DELETE FROM bible_verses;

-- Add unique constraint to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_bible_verses_unique ON bible_verses(book, chapter, verse, version);
