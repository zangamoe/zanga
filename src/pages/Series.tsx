import Navigation from "@/components/Navigation";
import SeriesCard from "@/components/SeriesCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Series = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allSeries, setAllSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    const { data: seriesData } = await supabase
      .from("series")
      .select(`
        *,
        chapters(chapter_number)
      `)
      .order("title");

    if (seriesData) {
      const formattedSeries = seriesData.map((series) => ({
        id: series.id,
        title: series.title,
        cover: series.cover_image_url,
        status: series.status as "ongoing" | "completed" | "hiatus",
        latestChapter: series.chapters?.length > 0 
          ? `Chapter ${Math.max(...series.chapters.map((c: any) => c.chapter_number))}`
          : undefined,
        description: series.synopsis,
      }));
      setAllSeries(formattedSeries);
    }
    setLoading(false);
  };

  const filteredSeries = allSeries.filter((series) =>
    series.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            All Series
          </h1>
          <p className="text-muted-foreground mb-6">
            Explore our growing collection of localized manga from talented Japanese artists.
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading series...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSeries.map((series) => (
                <div key={series.id} className="animate-fade-in">
                  <SeriesCard {...series} />
                </div>
              ))}
            </div>

            {filteredSeries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {allSeries.length === 0 
                    ? "No series available yet. Check back soon!"
                    : "No series found matching your search."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Series;
