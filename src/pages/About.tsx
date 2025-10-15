import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Globe, Users, BookOpen, ExternalLink } from "lucide-react";
import { SiKofi, SiPatreon } from "react-icons/si";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const About = () => {
  const [content, setContent] = useState({
    title: "Our Story",
    intro1: "",
    intro2: "",
    missionTitle: "Our Mission",
    missionText: "",
    communityTitle: "Our Community",
    communityText: "",
    qualityTitle: "Quality First",
    qualityText: "",
    passionTitle: "Passion Driven",
    passionText: "",
    supportTitle: "Support Our Project",
    supportText: "",
    kofiUrl: "https://ko-fi.com",
    patreonUrl: "https://patreon.com",
    disclaimer: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "about_title", "about_intro_1", "about_intro_2",
        "about_mission_title", "about_mission_text",
        "about_community_title", "about_community_text",
        "about_quality_title", "about_quality_text",
        "about_passion_title", "about_passion_text",
        "about_support_title", "about_support_text",
        "about_kofi_url", "about_patreon_url", "about_disclaimer"
      ]);

    if (data) {
      const newContent = { ...content };
      data.forEach((setting) => {
        const value = String(setting.value);
        if (setting.key === "about_title") newContent.title = value;
        if (setting.key === "about_intro_1") newContent.intro1 = value;
        if (setting.key === "about_intro_2") newContent.intro2 = value;
        if (setting.key === "about_mission_title") newContent.missionTitle = value;
        if (setting.key === "about_mission_text") newContent.missionText = value;
        if (setting.key === "about_community_title") newContent.communityTitle = value;
        if (setting.key === "about_community_text") newContent.communityText = value;
        if (setting.key === "about_quality_title") newContent.qualityTitle = value;
        if (setting.key === "about_quality_text") newContent.qualityText = value;
        if (setting.key === "about_passion_title") newContent.passionTitle = value;
        if (setting.key === "about_passion_text") newContent.passionText = value;
        if (setting.key === "about_support_title") newContent.supportTitle = value;
        if (setting.key === "about_support_text") newContent.supportText = value;
        if (setting.key === "about_kofi_url") newContent.kofiUrl = value;
        if (setting.key === "about_patreon_url") newContent.patreonUrl = value;
        if (setting.key === "about_disclaimer") newContent.disclaimer = value;
      });
      setContent(newContent);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent text-center">
            {content.title}
          </h1>

          <div className="prose prose-invert max-w-none mb-12">
            <Card className="bg-gradient-card border-border/50 mb-8">
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  {content.intro1}
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {content.intro2}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="bg-secondary/30 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-primary rounded-lg">
                      <Globe className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">{content.missionTitle}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {content.missionText}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-primary rounded-lg">
                      <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">{content.communityTitle}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {content.communityText}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-primary rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">{content.qualityTitle}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {content.qualityText}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-primary rounded-lg">
                      <Heart className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">{content.passionTitle}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {content.passionText}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Support Section */}
          <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-glow">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">{content.supportTitle}</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                {content.supportText}
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  <a href={content.kofiUrl} target="_blank" rel="noopener noreferrer">
                    <SiKofi className="h-5 w-5 mr-2" />
                    Support on Ko-fi
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
                
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <a href={content.patreonUrl} target="_blank" rel="noopener noreferrer">
                    <SiPatreon className="h-5 w-5 mr-2" />
                    Join on Patreon
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                {content.disclaimer}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
