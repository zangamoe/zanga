import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HomeSeriesCard from "@/components/HomeSeriesCard";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Series = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allSeries, setAllSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("alphabetical");
  const [pageContent, setPageContent] = useState({
    title: "All Series",
    subtitle: "Explore our growing collection of localized manga from talented Japanese artists.",
    searchPlaceholder: "Search series...",
    loadingText: "Loading series...",
    noResults: "No series found matching your search.",
    emptyText: "No series available yet. Check back soon!",
  });

  useEffect(() => {
    fetchSeries();
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["series_page_title", "series_page_subtitle", "series_search_placeholder", "series_loading_text", "series_no_results", "series_empty_text"]);

    if (data) {
      const newContent = { ...pageContent };
      data.forEach((item) => {
        const value = String(item.value);
        if (item.key === "series_page_title") newContent.title = value;
        if (item.key === "series_page_subtitle") newContent.subtitle = value;
        if (item.key === "series_search_placeholder") newContent.searchPlaceholder = value;
        if (item.key === "series_loading_text") newContent.loadingText = value;
        if (item.key === "series_no_results") newContent.noResults = value;
        if (item.key === "series_empty_text") newContent.emptyText = value;
      });
      setPageContent(newContent);
    }
  };

  const fetchSeries = async () => {
    const { data: seriesData } = await supabase
      .from("series")
      .select(`
        *,
        series_authors(author:authors(id, name)),
        series_genres(genre:genres(name))
      `)
      .eq("published", true)
      .order("title");

    if (seriesData) {
      const formattedSeries = seriesData.map((series) => ({
        id: series.id,
        title: series.title,
        cover: series.cover_image_url,
        status: series.status as "ongoing" | "completed" | "hiatus",
        authors: series.series_authors?.map((sa: any) => sa.author) || [],
        genres: series.series_genres?.map((sg: any) => sg.genre.name) || [],
        ratingsEnabled: series.ratings_enabled,
        isNew: series.is_new ?? false,
      }));
      setAllSeries(formattedSeries);
    }
    setLoading(false);
  };

  const filteredAndSortedSeries = allSeries
    .filter((series) =>
      series.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "newest":
          return a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {pageContent.title}
          </h1>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            {pageContent.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={pageContent.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{pageContent.loadingText}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {filteredAndSortedSeries.map((series) => (
                <HomeSeriesCard key={series.id} {...series} />
              ))}
            </div>

            {filteredAndSortedSeries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {allSeries.length === 0 
                    ? pageContent.emptyText
                    : pageContent.noResults}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Series;
