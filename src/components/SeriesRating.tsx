import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

interface SeriesRatingProps {
  seriesId: string;
  ratingsEnabled?: boolean;
  showCount?: boolean;
}

const SeriesRating = ({ seriesId, ratingsEnabled = true, showCount = false }: SeriesRatingProps) => {
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [chapterAvg, setChapterAvg] = useState(0);

  useEffect(() => {
    if (ratingsEnabled) {
      fetchRatings();
    }
  }, [seriesId, ratingsEnabled]);

  const fetchRatings = async () => {
    // Fetch series ratings
    const { data: seriesRatings } = await supabase
      .from("series_ratings")
      .select("rating")
      .eq("series_id", seriesId);

    // Fetch all chapter ratings for this series
    const { data: chapters } = await supabase
      .from("chapters")
      .select("id")
      .eq("series_id", seriesId);

    if (chapters) {
      const chapterIds = chapters.map(c => c.id);
      const { data: chapterRatings } = await supabase
        .from("chapter_ratings")
        .select("rating")
        .in("chapter_id", chapterIds);

      // Calculate chapter average
      if (chapterRatings && chapterRatings.length > 0) {
        const chapterAvgCalc = chapterRatings.reduce((sum, r) => sum + r.rating, 0) / chapterRatings.length;
        setChapterAvg(chapterAvgCalc);
      }
    }

    // Calculate combined rating (70% series ratings, 30% chapter ratings)
    if (seriesRatings && seriesRatings.length > 0) {
      const seriesAvg = seriesRatings.reduce((sum, r) => sum + r.rating, 0) / seriesRatings.length;
      const combined = chapterAvg > 0 
        ? (seriesAvg * 0.7 + chapterAvg * 0.3)
        : seriesAvg;
      
      setAvgRating(Math.round(combined * 10) / 10);
      setTotalRatings(seriesRatings.length);
    } else if (chapterAvg > 0) {
      setAvgRating(Math.round(chapterAvg * 10) / 10);
      setTotalRatings(0);
    }
  };

  if (!ratingsEnabled || (avgRating === 0 && totalRatings === 0)) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Star className="h-3 w-3" />
        <span>Not enough ratings</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
      <span className="font-semibold">{avgRating.toFixed(1)}</span>
      {showCount && totalRatings > 0 && (
        <span className="text-xs text-muted-foreground">({totalRatings})</span>
      )}
    </div>
  );
};

export default SeriesRating;
