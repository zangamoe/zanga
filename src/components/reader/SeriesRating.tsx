import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SeriesRatingProps {
  seriesId: string;
}

const SeriesRating = ({ seriesId }: SeriesRatingProps) => {
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserRating();
    }
  }, [seriesId, user]);

  const fetchUserRating = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("series_ratings")
      .select("rating")
      .eq("series_id", seriesId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setUserRating(data.rating);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      toast.error("Please sign in to rate");
      return;
    }

    const { error } = await supabase
      .from("series_ratings")
      .upsert(
        {
          series_id: seriesId,
          user_id: user.id,
          rating,
        },
        { onConflict: "series_id,user_id" }
      );

    if (error) {
      toast.error("Failed to save rating");
      return;
    }

    setUserRating(rating);
    toast.success("Rating saved!");
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">Rate this series</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => handleRating(star)}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoveredRating || userRating)
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        ))}
      </div>
      {userRating > 0 && (
        <p className="text-sm text-muted-foreground">
          You rated this {userRating} star{userRating !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};

export default SeriesRating;
