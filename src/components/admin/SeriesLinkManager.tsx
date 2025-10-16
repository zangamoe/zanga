import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface SeriesLinkManagerProps {
  authorId: string;
  onUpdate?: () => void;
}

const SeriesLinkManager = ({ authorId, onUpdate }: SeriesLinkManagerProps) => {
  const [allSeries, setAllSeries] = useState<any[]>([]);
  const [linkedSeriesIds, setLinkedSeriesIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [authorId]);

  const fetchData = async () => {
    // Fetch all series
    const { data: seriesData } = await supabase
      .from("series")
      .select("id, title, cover_image_url")
      .order("title");

    // Fetch currently linked series
    const { data: linkedData } = await supabase
      .from("series_authors")
      .select("series_id")
      .eq("author_id", authorId);

    if (seriesData) setAllSeries(seriesData);
    if (linkedData) setLinkedSeriesIds(linkedData.map((item) => item.series_id));
    setLoading(false);
  };

  const toggleSeries = (seriesId: string) => {
    setLinkedSeriesIds((prev) =>
      prev.includes(seriesId) ? prev.filter((id) => id !== seriesId) : [...prev, seriesId]
    );
  };

  const handleSave = async () => {
    setSaving(true);

    // Delete all existing links
    await supabase.from("series_authors").delete().eq("author_id", authorId);

    // Insert new links
    if (linkedSeriesIds.length > 0) {
      const { error } = await supabase
        .from("series_authors")
        .insert(linkedSeriesIds.map((seriesId) => ({ author_id: authorId, series_id: seriesId })));

      if (error) {
        toast.error("Failed to update series links");
        setSaving(false);
        return;
      }
    }

    toast.success("Series links updated successfully");
    setSaving(false);
    if (onUpdate) onUpdate();
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-4 bg-secondary/30 rounded-lg border border-border/50">
        {allSeries.map((series) => (
          <div key={series.id} className="flex items-start gap-3 p-3 bg-background/50 rounded border border-border/30">
            <Checkbox
              id={`series-${series.id}`}
              checked={linkedSeriesIds.includes(series.id)}
              onCheckedChange={() => toggleSeries(series.id)}
            />
            <label htmlFor={`series-${series.id}`} className="flex gap-3 cursor-pointer flex-1">
              <img src={series.cover_image_url} alt={series.title} className="w-12 h-16 object-cover rounded" />
              <div className="flex-1">
                <p className="font-semibold text-sm">{series.title}</p>
              </div>
            </label>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary hover:opacity-90 w-full">
        {saving ? "Saving..." : "Save Series Links"}
      </Button>
    </div>
  );
};

export default SeriesLinkManager;
