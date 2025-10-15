import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MerchandisePageContent = () => {
  const [settings, setSettings] = useState({
    merch_page_title: "Merchandise",
    merch_page_subtitle: "Support our authors by purchasing official merchandise. From manga volumes to art books and apparel, every purchase helps these talented artists continue their creative journey.",
    merch_loading_text: "Loading...",
    merch_empty_text: "No merchandise available yet. Check back soon!",
    merch_empty_subtitle: "Admins can add merchandise from the Admin Panel.",
    merch_cta_title: "Looking for something specific?",
    merch_cta_text: "We're always expanding our merchandise collection. If you have suggestions for products you'd like to see, reach out to us!",
    merch_cta_button: "Contact Us",
    merch_buy_button: "Buy Now",
    merch_coming_soon: "Link Coming Soon",
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

    toast.success("Merchandise page content updated successfully");
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle>Merchandise Page Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="merch_page_title">Page Title</Label>
          <Input
            id="merch_page_title"
            value={settings.merch_page_title}
            onChange={(e) => setSettings({ ...settings, merch_page_title: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="merch_page_subtitle">Page Subtitle</Label>
          <Textarea
            id="merch_page_subtitle"
            value={settings.merch_page_subtitle}
            onChange={(e) => setSettings({ ...settings, merch_page_subtitle: e.target.value })}
            className="bg-secondary border-border"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="merch_empty_text">Empty State Text</Label>
          <Input
            id="merch_empty_text"
            value={settings.merch_empty_text}
            onChange={(e) => setSettings({ ...settings, merch_empty_text: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="merch_cta_title">Call to Action Title</Label>
          <Input
            id="merch_cta_title"
            value={settings.merch_cta_title}
            onChange={(e) => setSettings({ ...settings, merch_cta_title: e.target.value })}
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <Label htmlFor="merch_cta_text">Call to Action Text</Label>
          <Textarea
            id="merch_cta_text"
            value={settings.merch_cta_text}
            onChange={(e) => setSettings({ ...settings, merch_cta_text: e.target.value })}
            className="bg-secondary border-border"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="merch_cta_button">CTA Button Text</Label>
          <Input
            id="merch_cta_button"
            value={settings.merch_cta_button}
            onChange={(e) => setSettings({ ...settings, merch_cta_button: e.target.value })}
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

export default MerchandisePageContent;
