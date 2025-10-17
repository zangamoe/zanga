import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Sparkles, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiDiscord } from "react-icons/si";

const Discord = () => {
  const [content, setContent] = useState({
    title: "Join Our Discord Community",
    subtitle: "Connect with fellow manga enthusiasts and stay updated",
    discordUrl: "https://discord.gg/",
    feature1Title: "Chat with Community",
    feature1Text: "Discuss your favorite series with other readers",
    feature2Title: "Get Updates First",
    feature2Text: "Be the first to know about new chapter releases",
    feature3Title: "Share Feedback",
    feature3Text: "Help us improve and suggest new series",
    ctaText: "Join Our Discord",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscordContent();
  }, []);

  const fetchDiscordContent = async () => {
    const { data } = await supabase
      .from("public_site_settings")
      .select("key, value")
      .in("key", [
        "discord_title",
        "discord_subtitle",
        "discord_url",
        "discord_feature1_title",
        "discord_feature1_text",
        "discord_feature2_title",
        "discord_feature2_text",
        "discord_feature3_title",
        "discord_feature3_text",
        "discord_cta_text",
      ]);

    if (data) {
      const newContent = { ...content };
      data.forEach((item) => {
        try {
          const value = JSON.parse(String(item.value));
          if (item.key === "discord_title") newContent.title = String(value);
          if (item.key === "discord_subtitle") newContent.subtitle = String(value);
          if (item.key === "discord_url") newContent.discordUrl = String(value);
          if (item.key === "discord_feature1_title") newContent.feature1Title = String(value);
          if (item.key === "discord_feature1_text") newContent.feature1Text = String(value);
          if (item.key === "discord_feature2_title") newContent.feature2Title = String(value);
          if (item.key === "discord_feature2_text") newContent.feature2Text = String(value);
          if (item.key === "discord_feature3_title") newContent.feature3Title = String(value);
          if (item.key === "discord_feature3_text") newContent.feature3Text = String(value);
          if (item.key === "discord_cta_text") newContent.ctaText = String(value);
        } catch {
          const value = String(item.value);
          if (item.key === "discord_title") newContent.title = value;
          if (item.key === "discord_subtitle") newContent.subtitle = value;
          if (item.key === "discord_url") newContent.discordUrl = value;
          if (item.key === "discord_feature1_title") newContent.feature1Title = value;
          if (item.key === "discord_feature1_text") newContent.feature1Text = value;
          if (item.key === "discord_feature2_title") newContent.feature2Title = value;
          if (item.key === "discord_feature2_text") newContent.feature2Text = value;
          if (item.key === "discord_feature3_title") newContent.feature3Title = value;
          if (item.key === "discord_feature3_text") newContent.feature3Text = value;
          if (item.key === "discord_cta_text") newContent.ctaText = value;
        }
      });
      setContent(newContent);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-primary rounded-2xl mb-6">
              <SiDiscord className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              {content.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {content.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-lg mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{content.feature1Title}</h3>
                <p className="text-sm text-muted-foreground">{content.feature1Text}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-lg mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{content.feature2Title}</h3>
                <p className="text-sm text-muted-foreground">{content.feature2Text}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-lg mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{content.feature3Title}</h3>
                <p className="text-sm text-muted-foreground">{content.feature3Text}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-glow">
            <CardContent className="p-8 text-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6"
              >
                <a
                  href={content.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <SiDiscord className="h-6 w-6" />
                  {content.ctaText}
                  <ExternalLink className="h-5 w-5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Discord;
