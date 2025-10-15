-- Add published column to authors table
ALTER TABLE public.authors 
ADD COLUMN published boolean NOT NULL DEFAULT true;

-- Add index for better performance
CREATE INDEX idx_authors_published ON public.authors(published);