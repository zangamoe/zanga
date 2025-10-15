import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SeriesPageContent = () => {
  const [settings, setSettings] = useState({
    series_page_title: "All Series",
    series_page_subtitle: "Explore our growing collection of localized manga from talented Japanese artists.",
    series_search_placeholder: "Search series...",
    series_loading_text: "Loading series...",
    series_no_results: "No series found matching your search.",
    series_empty_text: "No series available yet. Check back soon!",
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

    toast.success("Series page content updated successfully");
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle>Series Page Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="series_page_title">Page Title</Label>
          <Input
            id="series_page_title"
            value={settings.series_page_title}
            onChange={(e) => setSettings({ ...settings, series_page_title: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="series_page_subtitle">Page Subtitle</Label>
          <Textarea
            id="series_page_subtitle"
            value={settings.series_page_subtitle}
            onChange={(e) => setSettings({ ...settings, series_page_subtitle: e.target.value })}
            className="bg-secondary border-border"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="series_search_placeholder">Search Placeholder</Label>
          <Input
            id="series_search_placeholder"
            value={settings.series_search_placeholder}
            onChange={(e) => setSettings({ ...settings, series_search_placeholder: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="series_loading_text">Loading Text</Label>
          <Input
            id="series_loading_text"
            value={settings.series_loading_text}
            onChange={(e) => setSettings({ ...settings, series_loading_text: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="series_no_results">No Results Text</Label>
          <Input
            id="series_no_results"
            value={settings.series_no_results}
            onChange={(e) => setSettings({ ...settings, series_no_results: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="series_empty_text">Empty State Text</Label>
          <Input
            id="series_empty_text"
            value={settings.series_empty_text}
            onChange={(e) => setSettings({ ...settings, series_empty_text: e.target.value })}
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

export default SeriesPageContent;
