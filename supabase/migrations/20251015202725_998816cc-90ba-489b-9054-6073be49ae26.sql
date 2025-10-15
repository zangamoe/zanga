-- Create hero_slider_series table for manually selecting series for homepage slider
CREATE TABLE public.hero_slider_series (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  order_index integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_slider_series ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hero_slider_series
CREATE POLICY "Hero slider is viewable by everyone"
  ON public.hero_slider_series
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert hero slider"
  ON public.hero_slider_series
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update hero slider"
  ON public.hero_slider_series
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete hero slider"
  ON public.hero_slider_series
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_hero_slider_series_updated_at
  BEFORE UPDATE ON public.hero_slider_series
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();