import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const HomepagePageContent = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState({
    home_hero_badge: "",
    home_hero_title: "",
    home_hero_subtitle: "",
    home_hero_button_text: "",
    home_hero_image: "",
    featured_section_title: "",
    latest_releases_title: "",
    home_about_title: "",
    home_about_text: "",
    home_about_button_text: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .in("key", [
        "home_hero_badge",
        "home_hero_title",
        "home_hero_subtitle",
        "home_hero_button_text",
        "home_hero_image",
        "featured_section_title",
        "latest_releases_title",
        "home_about_title",
        "home_about_text",
        "home_about_button_text",
      ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading settings",
        description: error.message,
      });
    } else {
      const settingsMap: any = { ...settings };
      data?.forEach((item) => {
        try {
          settingsMap[item.key] = item.type === 'text' || item.type === 'html' || item.type === 'image'
            ? JSON.parse(item.value as string)
            : item.value;
        } catch {
          settingsMap[item.key] = item.value;
        }
      });
      setSettings(settingsMap);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `hero-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("manga-images")
      .upload(fileName, file);

    if (uploadError) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: uploadError.message,
      });
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from("manga-images")
        .getPublicUrl(fileName);
      
      setSettings({ ...settings, home_hero_image: publicUrl as string });
      toast({ title: "Image uploaded successfully" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
      type: key === 'home_hero_image' ? 'image' : 'text',
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .upsert(update, { onConflict: "key" });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error saving",
          description: error.message,
        });
        return;
      }
    }

    toast({ title: "Homepage content updated successfully" });
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Main banner at the top of the homepage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hero-badge">Badge Text</Label>
            <Input
              id="hero-badge"
              value={settings.home_hero_badge}
              onChange={(e) => setSettings({ ...settings, home_hero_badge: e.target.value })}
              placeholder="Discover Amazing Stories"
            />
          </div>

          <div>
            <Label htmlFor="hero-title">Main Title</Label>
            <Input
              id="hero-title"
              value={settings.home_hero_title}
              onChange={(e) => setSettings({ ...settings, home_hero_title: e.target.value })}
              placeholder="Welcome to Manga Reader"
            />
          </div>

          <div>
            <Label htmlFor="hero-subtitle">Subtitle</Label>
            <Textarea
              id="hero-subtitle"
              value={settings.home_hero_subtitle}
              onChange={(e) => setSettings({ ...settings, home_hero_subtitle: e.target.value })}
              placeholder="Read the latest manga chapters"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="hero-button">Button Text</Label>
            <Input
              id="hero-button"
              value={settings.home_hero_button_text}
              onChange={(e) => setSettings({ ...settings, home_hero_button_text: e.target.value })}
              placeholder="Browse Series"
            />
          </div>

          <div>
            <Label htmlFor="hero-image">Background Image</Label>
            <Input
              id="hero-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {settings.home_hero_image && (
              <img
                src={settings.home_hero_image}
                alt="Hero"
                className="mt-2 max-w-xs rounded"
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Section Titles</CardTitle>
          <CardDescription>Customize section headings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="latest-title">Latest Releases Title</Label>
            <Input
              id="latest-title"
              value={settings.latest_releases_title}
              onChange={(e) => setSettings({ ...settings, latest_releases_title: e.target.value })}
              placeholder="Latest Releases"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>About Section</CardTitle>
          <CardDescription>Bottom section of the homepage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="about-title">About Title</Label>
            <Input
              id="about-title"
              value={settings.home_about_title}
              onChange={(e) => setSettings({ ...settings, home_about_title: e.target.value })}
              placeholder="Supporting Aspiring Artists"
            />
          </div>

          <div>
            <Label htmlFor="about-text">About Text</Label>
            <Textarea
              id="about-text"
              value={settings.home_about_text}
              onChange={(e) => setSettings({ ...settings, home_about_text: e.target.value })}
              placeholder="We're dedicated to bringing exceptional manga..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="about-button">Button Text</Label>
            <Input
              id="about-button"
              value={settings.home_about_button_text}
              onChange={(e) => setSettings({ ...settings, home_about_button_text: e.target.value })}
              placeholder="Learn Our Story"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full" disabled={uploading}>
        {uploading ? "Uploading..." : "Save All Changes"}
      </Button>
    </div>
  );
};

export default HomepagePageContent;
