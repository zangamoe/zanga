-- Add is_new column to series table to manually mark series as new
ALTER TABLE public.series
ADD COLUMN is_new boolean NOT NULL DEFAULT false;