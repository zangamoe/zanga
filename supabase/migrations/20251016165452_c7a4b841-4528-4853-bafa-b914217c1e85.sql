-- Add detailed_synopsis column to series table
ALTER TABLE public.series
ADD COLUMN detailed_synopsis TEXT;

COMMENT ON COLUMN public.series.detailed_synopsis IS 'Detailed in-depth synopsis for the about section';