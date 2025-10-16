import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SeriesDetailPageContent = () => {
  const [settings, setSettings] = useState({
    series_detail_latest_chapters_title: "Latest Chapters",
    series_detail_latest_chapters_subtitle: "Stay up to date with the newest releases",
    series_detail_view_all_text: "View All",
    series_detail_about_tagline: "Experience every emotion, every whispered confession, and every heartbeat in this beautifully crafted tale.",
    series_detail_author_link_text: "Learn more about the series",
    series_detail_stats_chapters_label: "Chapters",
    series_detail_stats_next_release_label: "Next Release",
    series_detail_rating_title: "Rating",
    series_detail_your_rating_title: "Your Rating",
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

    toast.success("Series detail page labels updated successfully");
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle>Series Detail Page Labels</CardTitle>
        <CardDescription>Edit text labels that appear on ALL series detail pages</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="series_detail_latest_chapters_title">Latest Chapters Title</Label>
            <Input
              id="series_detail_latest_chapters_title"
              value={settings.series_detail_latest_chapters_title}
              onChange={(e) => setSettings({ ...settings, series_detail_latest_chapters_title: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <Label htmlFor="series_detail_latest_chapters_subtitle">Latest Chapters Subtitle</Label>
            <Input
              id="series_detail_latest_chapters_subtitle"
              value={settings.series_detail_latest_chapters_subtitle}
              onChange={(e) => setSettings({ ...settings, series_detail_latest_chapters_subtitle: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <Label htmlFor="series_detail_view_all_text">View All Button Text</Label>
            <Input
              id="series_detail_view_all_text"
              value={settings.series_detail_view_all_text}
              onChange={(e) => setSettings({ ...settings, series_detail_view_all_text: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <Label htmlFor="series_detail_author_link_text">Author Link Text</Label>
            <Input
              id="series_detail_author_link_text"
              value={settings.series_detail_author_link_text}
              onChange={(e) => setSettings({ ...settings, series_detail_author_link_text: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <Label htmlFor="series_detail_stats_chapters_label">Chapters Label</Label>
            <Input
              id="series_detail_stats_chapters_label"
              value={settings.series_detail_stats_chapters_label}
              onChange={(e) => setSettings({ ...settings, series_detail_stats_chapters_label: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <Label htmlFor="series_detail_stats_next_release_label">Next Release Label</Label>
            <Input
              id="series_detail_stats_next_release_label"
              value={settings.series_detail_stats_next_release_label}
              onChange={(e) => setSettings({ ...settings, series_detail_stats_next_release_label: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <Label htmlFor="series_detail_rating_title">Rating Section Title</Label>
            <Input
              id="series_detail_rating_title"
              value={settings.series_detail_rating_title}
              onChange={(e) => setSettings({ ...settings, series_detail_rating_title: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div>
            <Label htmlFor="series_detail_your_rating_title">Your Rating Title</Label>
            <Input
              id="series_detail_your_rating_title"
              value={settings.series_detail_your_rating_title}
              onChange={(e) => setSettings({ ...settings, series_detail_your_rating_title: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="series_detail_about_tagline">About Section Tagline (appears below description)</Label>
          <Textarea
            id="series_detail_about_tagline"
            value={settings.series_detail_about_tagline}
            onChange={(e) => setSettings({ ...settings, series_detail_about_tagline: e.target.value })}
            className="bg-secondary border-border"
            rows={2}
            placeholder="Experience every emotion, every whispered confession..."
          />
        </div>

        <Button onClick={handleSave} className="bg-gradient-primary hover:opacity-90">
          Save All Labels
        </Button>
      </CardContent>
    </Card>
  );
};

export default SeriesDetailPageContent;
