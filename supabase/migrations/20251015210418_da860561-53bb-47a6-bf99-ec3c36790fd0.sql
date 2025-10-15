-- Add published column to series table
ALTER TABLE public.series 
ADD COLUMN published boolean NOT NULL DEFAULT true;

-- Add index for better performance
CREATE INDEX idx_series_published ON public.series(published);