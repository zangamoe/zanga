import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import ChapterManagement from "./ChapterManagement";

interface SpecificSeriesEditorProps {
  seriesId: string;
  onBack: () => void;
}

const SpecificSeriesEditor = ({ seriesId, onBack }: SpecificSeriesEditorProps) => {
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aboutSettings, setAboutSettings] = useState({
    tagline: "",
    detailed_synopsis: "",
  });

  useEffect(() => {
    fetchSeries();
  }, [seriesId]);

  const fetchSeries = async () => {
    const { data } = await supabase
      .from("series")
      .select("*")
      .eq("id", seriesId)
      .single();

    if (data) {
      setSeries(data);
      setAboutSettings({
        tagline: data.tagline || "",
        detailed_synopsis: data.detailed_synopsis || "",
      });
    }
    setLoading(false);
  };

  const handleSaveAbout = async () => {
    const { error } = await supabase
      .from("series")
      .update({
        tagline: aboutSettings.tagline,
        detailed_synopsis: aboutSettings.detailed_synopsis,
      })
      .eq("id", seriesId);

    if (error) {
      toast.error("Failed to save about section");
    } else {
      toast.success("About section updated successfully");
      fetchSeries();
    }
  };

  const handleSaveBasicInfo = async () => {
    const { error } = await supabase
      .from("series")
      .update({
        title: series.title,
        synopsis: series.synopsis,
        status: series.status,
        next_chapter_release: series.next_chapter_release,
        published: series.published,
        ratings_enabled: series.ratings_enabled,
        is_new: series.is_new,
      })
      .eq("id", seriesId);

    if (error) {
      toast.error("Failed to save series info");
    } else {
      toast.success("Series info updated successfully");
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (!series) {
    return <div className="text-center py-4">Series not found</div>;
  }

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Series List
      </Button>

      <div>
        <h2 className="text-2xl font-bold mb-2">{series.title}</h2>
        <p className="text-muted-foreground">Edit all content for this series</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="about">About Section</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Edit the basic details of this series</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={series.title}
                  onChange={(e) => setSeries({ ...series, title: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <Label htmlFor="synopsis">Synopsis (Short)</Label>
                <Textarea
                  id="synopsis"
                  value={series.synopsis}
                  onChange={(e) => setSeries({ ...series, synopsis: e.target.value })}
                  className="bg-secondary border-border"
                  rows={3}
                />
              </div>

              <div>
                <Label>Custom URL Slug (optional)</Label>
                <Input
                  value={series.custom_slug || ""}
                  onChange={(e) =>
                    setSeries({ ...series, custom_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })
                  }
                  placeholder="e.g., my-series-name"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to use auto-generated ID. Only lowercase letters, numbers, and hyphens.
                </p>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={series.status}
                  onChange={(e) => setSeries({ ...series, status: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="e.g., Ongoing, Completed, Hiatus"
                />
              </div>

              <div>
                <Label htmlFor="next_release">Next Chapter Release</Label>
                <Input
                  id="next_release"
                  type="datetime-local"
                  value={series.next_chapter_release ? new Date(series.next_chapter_release).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setSeries({ ...series, next_chapter_release: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="bg-secondary border-border"
                />
              </div>

              <Button onClick={handleSaveBasicInfo} className="bg-gradient-primary hover:opacity-90">
                Save Basic Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>About This Series Section</CardTitle>
              <CardDescription>
                Edit the detailed description that appears in the "About {series.title}" section below Latest Chapters. The tagline and link text are edited in Series → General Settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="detailed_synopsis">Detailed Synopsis</Label>
                <Textarea
                  id="detailed_synopsis"
                  value={aboutSettings.detailed_synopsis}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, detailed_synopsis: e.target.value })}
                  className="bg-secondary border-border"
                  rows={10}
                  placeholder="Enter a detailed description of this series... This will appear in the About section on the series detail page."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  If left empty, the section will show "No additional information available yet."
                </p>
              </div>

              <div>
                <Label htmlFor="tagline">Tagline (Optional)</Label>
                <Textarea
                  id="tagline"
                  value={aboutSettings.tagline}
                  onChange={(e) => setAboutSettings({ ...aboutSettings, tagline: e.target.value })}
                  className="bg-secondary border-border"
                  rows={2}
                  placeholder="E.g., 'Experience every emotion, every whispered confession, and every heartbeat in this beautifully crafted tale.'"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  This appears in italics below the detailed synopsis in the About section.
                </p>
              </div>

              <Button onClick={handleSaveAbout} className="bg-gradient-primary hover:opacity-90">
                Save About Section
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chapters">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Chapter Management</CardTitle>
              <CardDescription>Manage chapters and pages for this series</CardDescription>
            </CardHeader>
            <CardContent>
              <ChapterManagement seriesId={seriesId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpecificSeriesEditor;
