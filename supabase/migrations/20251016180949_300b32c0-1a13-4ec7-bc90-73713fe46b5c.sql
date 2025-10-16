-- Add tagline column to series table
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS tagline TEXT;