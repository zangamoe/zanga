import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const DiscordManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState({
    discord_title: "Join Our Discord Community",
    discord_subtitle: "Connect with fellow manga enthusiasts and stay updated",
    discord_url: "https://discord.gg/",
    discord_feature1_title: "Chat with Community",
    discord_feature1_text: "Discuss your favorite series with other readers",
    discord_feature2_title: "Get Updates First",
    discord_feature2_text: "Be the first to know about new chapter releases",
    discord_feature3_title: "Share Feedback",
    discord_feature3_text: "Help us improve and suggest new series",
    discord_cta_text: "Join Our Discord",
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", Object.keys(content));

    if (data) {
      const newContent = { ...content };
      data.forEach((setting) => {
        newContent[setting.key as keyof typeof content] = String(setting.value || "");
      });
      setContent(newContent);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    const updates = Object.entries(content).map(([key, value]) => ({
      key,
      value: JSON.stringify(value),
      type: "text",
    }));

    for (const update of updates) {
      await supabase
        .from("site_settings")
        .upsert(update, { onConflict: "key" });
    }

    toast.success("Discord page content updated successfully");
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Header Section</CardTitle>
          <CardDescription>Main title and subtitle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="discord_title">Page Title</Label>
            <Input
              id="discord_title"
              value={content.discord_title}
              onChange={(e) => setContent({ ...content, discord_title: e.target.value })}
              placeholder="Join Our Discord Community"
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label htmlFor="discord_subtitle">Subtitle</Label>
            <Input
              id="discord_subtitle"
              value={content.discord_subtitle}
              onChange={(e) => setContent({ ...content, discord_subtitle: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label htmlFor="discord_url">Discord Invite URL</Label>
            <Input
              id="discord_url"
              type="url"
              value={content.discord_url}
              onChange={(e) => setContent({ ...content, discord_url: e.target.value })}
              placeholder="https://discord.gg/your-invite"
              className="bg-secondary border-border"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Feature Cards</CardTitle>
          <CardDescription>The three feature highlights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-semibold">Feature 1</h4>
            <div>
              <Label htmlFor="discord_feature1_title">Title</Label>
              <Input
                id="discord_feature1_title"
                value={content.discord_feature1_title}
                onChange={(e) => setContent({ ...content, discord_feature1_title: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label htmlFor="discord_feature1_text">Description</Label>
              <Textarea
                id="discord_feature1_text"
                value={content.discord_feature1_text}
                onChange={(e) => setContent({ ...content, discord_feature1_text: e.target.value })}
                rows={2}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Feature 2</h4>
            <div>
              <Label htmlFor="discord_feature2_title">Title</Label>
              <Input
                id="discord_feature2_title"
                value={content.discord_feature2_title}
                onChange={(e) => setContent({ ...content, discord_feature2_title: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label htmlFor="discord_feature2_text">Description</Label>
              <Textarea
                id="discord_feature2_text"
                value={content.discord_feature2_text}
                onChange={(e) => setContent({ ...content, discord_feature2_text: e.target.value })}
                rows={2}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Feature 3</h4>
            <div>
              <Label htmlFor="discord_feature3_title">Title</Label>
              <Input
                id="discord_feature3_title"
                value={content.discord_feature3_title}
                onChange={(e) => setContent({ ...content, discord_feature3_title: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label htmlFor="discord_feature3_text">Description</Label>
              <Textarea
                id="discord_feature3_text"
                value={content.discord_feature3_text}
                onChange={(e) => setContent({ ...content, discord_feature3_text: e.target.value })}
                rows={2}
                className="bg-secondary border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Call-to-Action</CardTitle>
          <CardDescription>Button text</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="discord_cta_text">Button Text</Label>
          <Input
            id="discord_cta_text"
            value={content.discord_cta_text}
            onChange={(e) => setContent({ ...content, discord_cta_text: e.target.value })}
            className="bg-secondary border-border"
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary hover:opacity-90 w-full">
        {saving ? "Saving..." : "Save All Changes"}
      </Button>
    </div>
  );
};

export default DiscordManagement;
