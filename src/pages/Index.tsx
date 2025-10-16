import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, TrendingUp, Library, Flame, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import HomeSeriesCard from "@/components/HomeSeriesCard";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import heroGradient from "@/assets/hero-gradient-bg.jpg";
import sectionPattern from "@/assets/section-bg-pattern.jpg";

interface SiteSetting {
  key: string;
  value: any;
  type: string;
}

interface Series {
  id: string;
  title: string;
  cover_image_url: string;
  synopsis: string;
  status: string;
  ratings_enabled?: boolean;
}


const Index = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [popularSeries, setPopularSeries] = useState<Series[]>([]);
  const [latestSeries, setLatestSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      // Fetch site settings from secure public view
      const { data: settingsData, error: settingsError } = await supabase
        .from("public_site_settings")
        .select("*");

      if (settingsError) throw settingsError;

      // Convert settings array to object
      const settingsMap: Record<string, string> = {};
      settingsData?.forEach((setting: SiteSetting) => {
        try {
          settingsMap[setting.key] = setting.type === 'text' || setting.type === 'html' || setting.type === 'image'
            ? JSON.parse(setting.value)
            : setting.value;
        } catch {
          settingsMap[setting.key] = setting.value;
        }
      });
      setSettings(settingsMap);

      // Fetch popular series from hero slider with full details
      const { data: sliderData, error: sliderError } = await supabase
        .from("hero_slider_series")
        .select(`
          *,
          series:series_id (
            id,
            title,
            cover_image_url,
            synopsis,
            status,
            published,
            ratings_enabled,
            created_at,
            series_authors(author:authors(id, name)),
            series_genres(genre:genres(name))
          )
        `)
        .eq("enabled", true)
        .order("order_index");

      if (sliderError) throw sliderError;
      // Filter only published series and format data
      const popularSeriesData = (sliderData || [])
        .map((item: any) => {
          const series = item.series;
          if (!series.published) return null;
          return {
            ...series,
            authors: series.series_authors?.map((sa: any) => sa.author) || [],
            genres: series.series_genres?.map((sg: any) => sg.genre.name) || [],
          };
        })
        .filter(Boolean);
      setPopularSeries(popularSeriesData);

      // Fetch latest series with full details
      const { data: seriesData, error: seriesError } = await supabase
        .from("series")
        .select(`
          *,
          series_authors(author:authors(id, name)),
          series_genres(genre:genres(name))
        `)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (seriesError) throw seriesError;
      const formattedLatestSeries = (seriesData || []).map((series: any) => ({
        ...series,
        authors: series.series_authors?.map((sa: any) => sa.author) || [],
        genres: series.series_genres?.map((sg: any) => sg.genre.name) || [],
        isNew: new Date(series.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      }));
      setLatestSeries(formattedLatestSeries);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading content",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Banner */}
      <section className="relative h-[55vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings.home_hero_image || heroGradient}
            alt="Hero Banner"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="container relative mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4 md:mb-6 animate-fade-in">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Sparkles className="h-5 w-5 md:h-7 md:w-7 text-white" />
              </div>
              <span className="text-primary font-bold text-base md:text-lg uppercase tracking-wider">
                {settings.home_hero_badge || "Discover Amazing Stories"}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 leading-tight animate-slide-in">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {settings.home_hero_title || "Welcome to Manga Reader"}
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-foreground/90 mb-8 md:mb-10 leading-relaxed max-w-2xl">
              {settings.home_hero_subtitle || "Read the latest manga chapters"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-all hover:scale-105 text-lg px-8 py-6">
                <Link to="/series" className="flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  {settings.home_hero_button_text || "Browse Series"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-primary/50 hover:bg-primary/10 text-lg px-8 py-6">
                <Link to="/about" className="flex items-center gap-2">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Releases */}
      {popularSeries.length > 0 && (
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <img src={sectionPattern} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Library className="h-6 w-6 text-primary" />
                  <h2 className="text-3xl md:text-4xl font-black">Browse Series</h2>
                </div>
                <p className="text-muted-foreground">Most loved by our community</p>
              </div>
              <Button asChild variant="outline" size="lg" className="hidden md:flex border-primary/50 hover:bg-primary/10">
                <Link to="/series" className="flex items-center gap-2">
                  View All
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {popularSeries.map((series: any) => (
                <div key={series.id} className="animate-fade-in">
                  <HomeSeriesCard
                    id={series.id}
                    title={series.title}
                    cover={series.cover_image_url}
                    status={series.status as "ongoing" | "completed"}
                    authors={series.authors}
                    genres={series.genres}
                    ratingsEnabled={series.ratings_enabled}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Releases - AUTO-POPULATED FROM SERIES */}
      {latestSeries.length > 0 && (
        <section className="relative py-12 md:py-20 bg-secondary/20">
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Flame className="h-6 w-6 text-primary animate-pulse" />
                  <h2 className="text-3xl md:text-4xl font-black">
                    {settings.latest_releases_title || "Latest Releases"}
                  </h2>
                </div>
                <p className="text-muted-foreground">Fresh off the press</p>
              </div>
              <Button asChild variant="outline" size="lg" className="hidden md:flex border-primary/50 hover:bg-primary/10">
                <Link to="/series" className="flex items-center gap-2">
                  View All
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {latestSeries.map((series: any, index: number) => (
                <div 
                  key={series.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <HomeSeriesCard
                    id={series.id}
                    title={series.title}
                    cover={series.cover_image_url}
                    status={series.status as "ongoing" | "completed"}
                    authors={series.authors}
                    genres={series.genres}
                    ratingsEnabled={series.ratings_enabled}
                    isNew={series.isNew}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section - EDITABLE IN SITE CONTENT */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute inset-0 opacity-10">
          <img src={sectionPattern} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black mb-6 bg-gradient-primary bg-clip-text text-transparent">
                {settings.home_about_title || "Supporting Aspiring Artists"}
              </h2>
              <p className="text-lg md:text-xl text-foreground/80 leading-relaxed mb-8">
                {settings.home_about_text || "We're dedicated to bringing exceptional manga from talented Japanese artists to English-speaking audiences."}
              </p>
              <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-all hover:scale-105 text-lg px-8">
                <Link to="/about" className="flex items-center gap-2">
                  {settings.home_about_button_text || "Learn Our Story"}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
