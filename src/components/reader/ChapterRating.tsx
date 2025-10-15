import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Star } from "lucide-react";

const ChapterRating = ({ chapterId, seriesId }: { chapterId: string; seriesId: string }) => {
  const { user } = useAuth();
  const [userChapterRating, setUserChapterRating] = useState(0);
  const [userSeriesRating, setUserSeriesRating] = useState(0);
  const [avgChapterRating, setAvgChapterRating] = useState(0);

  useEffect(() => {
    fetchRatings();
  }, [chapterId, user]);

  const fetchRatings = async () => {
    // Fetch user's chapter rating
    if (user) {
      const { data: chapterData } = await supabase
        .from("chapter_ratings")
        .select("rating")
        .eq("chapter_id", chapterId)
        .eq("user_id", user.id)
        .single();
      
      if (chapterData) setUserChapterRating(chapterData.rating);

      const { data: seriesData } = await supabase
        .from("series_ratings")
        .select("rating")
        .eq("series_id", seriesId)
        .eq("user_id", user.id)
        .single();
      
      if (seriesData) setUserSeriesRating(seriesData.rating);
    }

    // Fetch average chapter rating
    const { data: allRatings } = await supabase
      .from("chapter_ratings")
      .select("rating")
      .eq("chapter_id", chapterId);

    if (allRatings && allRatings.length > 0) {
      const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      setAvgChapterRating(Math.round(avg * 10) / 10);
    }
  };

  const handleChapterRating = async (rating: number) => {
    if (!user) {
      toast.error("Please sign in to rate");
      return;
    }

    const { error } = await supabase
      .from("chapter_ratings")
      .upsert({
        chapter_id: chapterId,
        user_id: user.id,
        rating
      });

    if (error) {
      toast.error("Failed to save rating");
    } else {
      toast.success("Rating saved!");
      setUserChapterRating(rating);
      fetchRatings();
    }
  };

  const handleSeriesRating = async (rating: number) => {
    if (!user) {
      toast.error("Please sign in to rate");
      return;
    }

    const { error } = await supabase
      .from("series_ratings")
      .upsert({
        series_id: seriesId,
        user_id: user.id,
        rating
      });

    if (error) {
      toast.error("Failed to save series rating");
    } else {
      toast.success("Series rating saved!");
      setUserSeriesRating(rating);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Rate This Chapter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chapter Rating */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Chapter Rating {avgChapterRating > 0 && `(Avg: ${avgChapterRating}/5)`}
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant="ghost"
                size="sm"
                onClick={() => handleChapterRating(star)}
                disabled={!user}
                className="p-0 h-auto hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= userChapterRating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
            ))}
          </div>
        </div>

        {/* Series Rating */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Overall Series Rating
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant="ghost"
                size="sm"
                onClick={() => handleSeriesRating(star)}
                disabled={!user}
                className="p-0 h-auto hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= userSeriesRating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChapterRating;
