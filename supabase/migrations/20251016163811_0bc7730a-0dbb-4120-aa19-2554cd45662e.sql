-- Add next_chapter_release to series table
ALTER TABLE public.series 
ADD COLUMN next_chapter_release timestamp with time zone;