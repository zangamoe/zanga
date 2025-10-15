import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthorsPageContent = () => {
  const [settings, setSettings] = useState({
    authors_page_title: "Our Authors",
    authors_page_subtitle: "Meet the talented Japanese manga artists we're proud to work with. Each brings their unique vision and storytelling prowess to create unforgettable narratives.",
    authors_single_subtitle: "Explore this talented artist's works and connect with them.",
    authors_loading_text: "Loading authors...",
    authors_empty_text: "No authors available yet. Check back soon!",
    authors_no_bio: "No bio available.",
    authors_works_label: "Works:",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", Object.keys(settings));

    if (data) {
      const newSettings = { ...settings };
      data.forEach((item) => {
        newSettings[item.key as keyof typeof settings] = String(item.value);
      });
      setSettings(newSettings);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      type: "text",
      value: JSON.stringify(value),
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("site_settings")
        .upsert(update, { onConflict: "key" });

      if (error) {
        toast.error("Failed to save settings");
        return;
      }
    }

    toast.success("Authors page content updated successfully");
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle>Authors Page Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="authors_page_title">Page Title</Label>
          <Input
            id="authors_page_title"
            value={settings.authors_page_title}
            onChange={(e) => setSettings({ ...settings, authors_page_title: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="authors_page_subtitle">Page Subtitle (All Authors)</Label>
          <Textarea
            id="authors_page_subtitle"
            value={settings.authors_page_subtitle}
            onChange={(e) => setSettings({ ...settings, authors_page_subtitle: e.target.value })}
            className="bg-secondary border-border"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="authors_single_subtitle">Subtitle (Single Author)</Label>
          <Input
            id="authors_single_subtitle"
            value={settings.authors_single_subtitle}
            onChange={(e) => setSettings({ ...settings, authors_single_subtitle: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="authors_loading_text">Loading Text</Label>
          <Input
            id="authors_loading_text"
            value={settings.authors_loading_text}
            onChange={(e) => setSettings({ ...settings, authors_loading_text: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="authors_empty_text">Empty State Text</Label>
          <Input
            id="authors_empty_text"
            value={settings.authors_empty_text}
            onChange={(e) => setSettings({ ...settings, authors_empty_text: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="authors_no_bio">No Bio Text</Label>
          <Input
            id="authors_no_bio"
            value={settings.authors_no_bio}
            onChange={(e) => setSettings({ ...settings, authors_no_bio: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="authors_works_label">Works Label</Label>
          <Input
            id="authors_works_label"
            value={settings.authors_works_label}
            onChange={(e) => setSettings({ ...settings, authors_works_label: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <Button onClick={handleSave} className="bg-gradient-primary hover:opacity-90">
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthorsPageContent;
