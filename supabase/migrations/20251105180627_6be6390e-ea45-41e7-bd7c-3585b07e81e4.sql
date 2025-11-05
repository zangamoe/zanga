-- Add imgur_album_url to chapters table for direct imgur hosting
ALTER TABLE chapters ADD COLUMN imgur_album_url TEXT;

COMMENT ON COLUMN chapters.imgur_album_url IS 'Imgur album URL for chapter pages (alternative to storing individual pages in chapter_pages table)';