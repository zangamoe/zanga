import { useEffect, useState } from "react";
import { ArrowRight, Rocket, Library } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HomepageSection from "@/components/HomepageSection";
import MetadataUpdater from "@/components/MetadataUpdater";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import heroGradient from "@/assets/hero-gradient-bg.jpg";
import sectionPattern from "@/assets/section-bg-pattern.jpg";

interface SiteSetting {
  key: string;
  value: any;
  type: string;
}

interface HomepageSection {
  id: string;
  title: string;
  section_type: string;
  filter_criteria: any;
  order_index: number;
}

const Index = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<HomepageSection[]>([]);
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

      // Fetch homepage sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("homepage_sections")
        .select("*")
        .eq("enabled", true)
        .order("order_index");

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);
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
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Full Page Background Gradient */}
      <div className="fixed inset-0 -z-10">
        <img
          src={settings.home_hero_image || heroGradient}
          alt="Background"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />
      </div>

      <MetadataUpdater />
      <SEO
        title={settings.site_title || "Zanga - Discover On The Rise Manga Series"}
        description={settings.site_description || "Discover professionally localized manga from aspiring Japanese authors. Read on the rise manga translated for English-speaking audiences."}
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Zanga",
          "url": window.location.origin,
          "description": "Discover professionally localized manga from aspiring Japanese authors",
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${window.location.origin}/series?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        }}
      />
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
                <Rocket className="h-5 w-5 md:h-7 md:w-7 text-white" />
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

      {/* Dynamic Homepage Sections - Crunchyroll Style */}
      <div className="flex-1 bg-background">
        {sections.map((section) => (
          <HomepageSection
            key={section.id}
            title={section.title}
            sectionType={section.section_type}
            filterCriteria={section.filter_criteria}
          />
        ))}
      </div>

      {/* About Section */}
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

      <Footer />
    </div>
  );
};

export default Index;
