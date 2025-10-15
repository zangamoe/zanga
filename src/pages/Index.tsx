import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SeriesCard from "@/components/SeriesCard";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
      // Fetch site settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("site_settings")
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

      // Fetch popular series from hero slider
      const { data: sliderData, error: sliderError } = await supabase
        .from("hero_slider_series")
        .select(`
          *,
          series:series_id (
            id,
            title,
            cover_image_url,
            synopsis,
            status
          )
        `)
        .eq("enabled", true)
        .order("order_index");

      if (sliderError) throw sliderError;
      const popularSeriesData = (sliderData || []).map((item: any) => item.series);
      setPopularSeries(popularSeriesData);

      // Fetch latest series
      const { data: seriesData, error: seriesError } = await supabase
        .from("series")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (seriesError) throw seriesError;
      setLatestSeries(seriesData || []);
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
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          {settings.home_hero_image && (
            <>
              <img
                src={settings.home_hero_image}
                alt="Hero Banner"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            </>
          )}
          {!settings.home_hero_image && (
            <div className="h-full w-full bg-gradient-to-r from-primary/20 to-secondary/20" />
          )}
        </div>
        
        <div className="container relative mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-primary font-semibold">
                {settings.home_hero_badge || "Discover Amazing Stories"}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              {settings.home_hero_title || "Welcome to Manga Reader"}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {settings.home_hero_subtitle || "Read the latest manga chapters"}
            </p>
            <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
              <Link to="/series" className="flex items-center gap-2">
                {settings.home_hero_button_text || "Browse Series"}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Releases */}
      {popularSeries.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Popular Releases</h2>
            <Button asChild variant="ghost">
              <Link to="/series" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularSeries.map((series) => (
              <div key={series.id} className="animate-fade-in">
                <SeriesCard
                  id={series.id}
                  title={series.title}
                  cover={series.cover_image_url}
                  status={series.status as "ongoing" | "completed"}
                  description={series.synopsis}
                  latestChapter="View Chapters"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Releases - AUTO-POPULATED FROM SERIES */}
      {latestSeries.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {settings.latest_releases_title || "Latest Releases"}
            </h2>
            <Button asChild variant="ghost">
              <Link to="/series" className="flex items-center gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestSeries.map((series) => (
              <div key={series.id} className="animate-fade-in">
                <SeriesCard
                  id={series.id}
                  title={series.title}
                  cover={series.cover_image_url}
                  status={series.status as "ongoing" | "completed"}
                  description={series.synopsis}
                  latestChapter="View Chapters"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* About Section - EDITABLE IN SITE CONTENT */}
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              {settings.home_about_title || "Supporting Aspiring Artists"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {settings.home_about_text || "We're dedicated to bringing exceptional manga from talented Japanese artists to English-speaking audiences."}
            </p>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/about">
                {settings.home_about_button_text || "Learn Our Story"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
