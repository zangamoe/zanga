import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import HomeSeriesCard from "@/components/HomeSeriesCard";
import { supabase } from "@/integrations/supabase/client";

interface Series {
  id: string;
  title: string;
  cover_image_url: string;
  synopsis: string;
  status: string;
  ratings_enabled?: boolean;
  created_at: string;
  authors?: Array<{ id: string; name: string }>;
  genres?: string[];
}

interface HomepageSectionProps {
  title: string;
  sectionType: string;
  filterCriteria?: any;
}

const HomepageSection = ({ title, sectionType, filterCriteria }: HomepageSectionProps) => {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSectionSeries();
  }, [sectionType, filterCriteria]);

  const fetchSectionSeries = async () => {
    try {
      let query = supabase
        .from("series")
        .select(`
          *,
          series_authors(author:authors(id, name)),
          series_genres(genre:genres(name))
        `)
        .eq("published", true);

      // Apply filters based on section type
      if (sectionType === "latest") {
        query = query.order("created_at", { ascending: false }).limit(12);
      } else if (sectionType === "popular") {
        // Fetch series with ratings
        const { data: ratedSeries } = await supabase
          .from("series_ratings_summary")
          .select("series_id, average_rating, total_ratings")
          .order("total_ratings", { ascending: false })
          .limit(12);

        if (ratedSeries && ratedSeries.length > 0) {
          const seriesIds = ratedSeries.map(r => r.series_id);
          query = query.in("id", seriesIds);
        }
      } else if (sectionType === "genre" && filterCriteria?.genre_id) {
        // Filter by genre
        const { data: genreSeries } = await supabase
          .from("series_genres")
          .select("series_id")
          .eq("genre_id", filterCriteria.genre_id);

        if (genreSeries && genreSeries.length > 0) {
          const seriesIds = genreSeries.map(gs => gs.series_id);
          query = query.in("id", seriesIds).limit(12);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedSeries = (data || []).map((s: any) => ({
        ...s,
        authors: s.series_authors?.map((sa: any) => sa.author) || [],
        genres: s.series_genres?.map((sg: any) => sg.genre.name) || [],
      }));

      setSeries(formattedSeries);
    } catch (error) {
      console.error("Error fetching section series:", error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
    scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  if (loading || series.length === 0) return null;

  return (
    <section className="relative py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-black">{title}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="border-border/50 hover:bg-primary/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="border-border/50 hover:bg-primary/10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {series.map((s) => (
            <div key={s.id} className="flex-none w-[160px] md:w-[200px]">
              <HomeSeriesCard
                id={s.id}
                title={s.title}
                cover={s.cover_image_url}
                status={s.status as "ongoing" | "completed"}
                authors={s.authors}
                genres={s.genres}
                ratingsEnabled={s.ratings_enabled}
                isNew={new Date(s.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomepageSection;
