-- Add reading direction to chapters
ALTER TABLE public.chapters
ADD COLUMN reading_direction text NOT NULL DEFAULT 'rtl';

-- Add ratings enabled to series
ALTER TABLE public.series
ADD COLUMN ratings_enabled boolean NOT NULL DEFAULT true;

-- Create chapter comments table
CREATE TABLE public.chapter_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create chapter ratings table
CREATE TABLE public.chapter_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(chapter_id, user_id)
);

-- Create series ratings table
CREATE TABLE public.series_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(series_id, user_id)
);

-- Create chapter reactions table
CREATE TABLE public.chapter_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(chapter_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.chapter_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chapter_comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.chapter_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.chapter_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.chapter_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comment"
  ON public.chapter_comments FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for chapter_ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON public.chapter_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings"
  ON public.chapter_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.chapter_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for series_ratings
CREATE POLICY "Series ratings are viewable by everyone"
  ON public.series_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create series ratings"
  ON public.series_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own series ratings"
  ON public.series_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for chapter_reactions
CREATE POLICY "Reactions are viewable by everyone"
  ON public.chapter_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can create reactions"
  ON public.chapter_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON public.chapter_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_chapter_comments_chapter ON public.chapter_comments(chapter_id);
CREATE INDEX idx_chapter_ratings_chapter ON public.chapter_ratings(chapter_id);
CREATE INDEX idx_series_ratings_series ON public.series_ratings(series_id);
CREATE INDEX idx_chapter_reactions_chapter ON public.chapter_reactions(chapter_id);