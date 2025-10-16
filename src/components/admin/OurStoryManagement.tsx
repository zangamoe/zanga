import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const OurStoryManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState({
    about_title: "",
    about_intro_1: "",
    about_intro_2: "",
    about_mission_title: "",
    about_mission_text: "",
    about_community_title: "",
    about_community_text: "",
    about_quality_title: "",
    about_quality_text: "",
    about_passion_title: "",
    about_passion_text: "",
    about_support_title: "",
    about_support_text: "",
    about_kofi_url: "",
    about_patreon_url: "",
    about_disclaimer: "",
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

    // Upsert all settings
    for (const update of updates) {
      await supabase
        .from("site_settings")
        .upsert(update, { onConflict: "key" });
    }

    toast.success("Our Story content updated successfully");
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
          <CardDescription>Main title and introductory paragraphs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="about_title">Page Title</Label>
            <Input
              id="about_title"
              value={content.about_title}
              onChange={(e) => setContent({ ...content, about_title: e.target.value })}
              placeholder="Our Story"
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label htmlFor="about_intro_1">Introduction Paragraph 1</Label>
            <Textarea
              id="about_intro_1"
              value={content.about_intro_1}
              onChange={(e) => setContent({ ...content, about_intro_1: e.target.value })}
              rows={4}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label htmlFor="about_intro_2">Introduction Paragraph 2</Label>
            <Textarea
              id="about_intro_2"
              value={content.about_intro_2}
              onChange={(e) => setContent({ ...content, about_intro_2: e.target.value })}
              rows={4}
              className="bg-secondary border-border"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Feature Cards</CardTitle>
          <CardDescription>The four main value proposition cards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="font-semibold">Card 1: Mission</h4>
            <div>
              <Label htmlFor="about_mission_title">Title</Label>
              <Input
                id="about_mission_title"
                value={content.about_mission_title}
                onChange={(e) => setContent({ ...content, about_mission_title: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label htmlFor="about_mission_text">Description</Label>
              <Textarea
                id="about_mission_text"
                value={content.about_mission_text}
                onChange={(e) => setContent({ ...content, about_mission_text: e.target.value })}
                rows={3}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Card 2: Community</h4>
            <div>
              <Label htmlFor="about_community_title">Title</Label>
              <Input
                id="about_community_title"
                value={content.about_community_title}
                onChange={(e) => setContent({ ...content, about_community_title: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label htmlFor="about_community_text">Description</Label>
              <Textarea
                id="about_community_text"
                value={content.about_community_text}
                onChange={(e) => setContent({ ...content, about_community_text: e.target.value })}
                rows={3}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Card 3: Quality</h4>
            <div>
              <Label htmlFor="about_quality_title">Title</Label>
              <Input
                id="about_quality_title"
                value={content.about_quality_title}
                onChange={(e) => setContent({ ...content, about_quality_title: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label htmlFor="about_quality_text">Description</Label>
              <Textarea
                id="about_quality_text"
                value={content.about_quality_text}
                onChange={(e) => setContent({ ...content, about_quality_text: e.target.value })}
                rows={3}
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Card 4: Passion</h4>
            <div>
              <Label htmlFor="about_passion_title">Title</Label>
              <Input
                id="about_passion_title"
                value={content.about_passion_title}
                onChange={(e) => setContent({ ...content, about_passion_title: e.target.value })}
                className="bg-secondary border-border"
              />
            </div>
            <div>
              <Label htmlFor="about_passion_text">Description</Label>
              <Textarea
                id="about_passion_text"
                value={content.about_passion_text}
                onChange={(e) => setContent({ ...content, about_passion_text: e.target.value })}
                rows={3}
                className="bg-secondary border-border"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Support Section</CardTitle>
          <CardDescription>Call-to-action for supporters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="about_support_title">Support Title</Label>
            <Input
              id="about_support_title"
              value={content.about_support_title}
              onChange={(e) => setContent({ ...content, about_support_title: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label htmlFor="about_support_text">Support Text</Label>
            <Textarea
              id="about_support_text"
              value={content.about_support_text}
              onChange={(e) => setContent({ ...content, about_support_text: e.target.value })}
              rows={3}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label htmlFor="about_kofi_url">Ko-fi URL</Label>
            <Input
              id="about_kofi_url"
              type="url"
              value={content.about_kofi_url}
              onChange={(e) => setContent({ ...content, about_kofi_url: e.target.value })}
              placeholder="https://ko-fi.com/yourname"
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label htmlFor="about_patreon_url">Patreon URL</Label>
            <Input
              id="about_patreon_url"
              type="url"
              value={content.about_patreon_url}
              onChange={(e) => setContent({ ...content, about_patreon_url: e.target.value })}
              placeholder="https://patreon.com/yourname"
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <Label htmlFor="about_disclaimer">Support Disclaimer</Label>
            <Textarea
              id="about_disclaimer"
              value={content.about_disclaimer}
              onChange={(e) => setContent({ ...content, about_disclaimer: e.target.value })}
              rows={2}
              placeholder="E.g., Every contribution goes directly into creating more content for you."
              className="bg-secondary border-border"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary hover:opacity-90 w-full">
        {saving ? "Saving..." : "Save All Changes"}
      </Button>
    </div>
  );
};

export default OurStoryManagement;
