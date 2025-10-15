import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Trash2, GripVertical, Eye, EyeOff, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Series {
  id: string;
  title: string;
  cover_image_url: string;
  synopsis: string;
}

interface HeroSliderItem {
  id: string;
  series_id: string;
  order_index: number;
  enabled: boolean;
  series: Series;
}

const HeroSliderManagement = () => {
  const [sliderItems, setSliderItems] = useState<HeroSliderItem[]>([]);
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch slider items with series data
    const { data: sliderData, error: sliderError } = await supabase
      .from("hero_slider_series")
      .select(`
        *,
        series:series_id (
          id,
          title,
          cover_image_url,
          synopsis
        )
      `)
      .order("order_index");

    if (sliderError) {
      toast({
        variant: "destructive",
        title: "Error loading slider",
        description: sliderError.message,
      });
    } else {
      setSliderItems((sliderData || []) as any);
    }

    // Fetch all series for dropdown
    const { data: seriesData, error: seriesError } = await supabase
      .from("series")
      .select("id, title, cover_image_url, synopsis")
      .order("title");

    if (seriesError) {
      toast({
        variant: "destructive",
        title: "Error loading series",
        description: seriesError.message,
      });
    } else {
      setAllSeries(seriesData || []);
    }

    setLoading(false);
  };

  const handleAdd = async () => {
    if (!selectedSeriesId) {
      toast({
        variant: "destructive",
        title: "Please select a series",
      });
      return;
    }

    const { error } = await supabase
      .from("hero_slider_series")
      .insert({
        series_id: selectedSeriesId,
        order_index: sliderItems.length,
        enabled: true,
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error adding to slider",
        description: error.message,
      });
    } else {
      toast({ title: "Series added to hero slider" });
      fetchData();
      setDialogOpen(false);
      setSelectedSeriesId("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this series from the hero slider?")) return;

    const { error } = await supabase
      .from("hero_slider_series")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error removing series",
        description: error.message,
      });
    } else {
      toast({ title: "Series removed from slider" });
      fetchData();
    }
  };

  const toggleEnabled = async (item: HeroSliderItem) => {
    const { error } = await supabase
      .from("hero_slider_series")
      .update({ enabled: !item.enabled })
      .eq("id", item.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating slider",
        description: error.message,
      });
    } else {
      fetchData();
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Manage series shown in the hero slider. Drag to reorder.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Series to Slider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Series to Hero Slider</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Series</Label>
                <Select value={selectedSeriesId} onValueChange={setSelectedSeriesId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a series" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSeries
                      .filter(s => !sliderItems.some(item => item.series_id === s.id))
                      .map((series) => (
                        <SelectItem key={series.id} value={series.id}>
                          {series.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd}>Add to Slider</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sliderItems.map((item) => (
          <Card
            key={item.id}
            className={`bg-gradient-card border-border/50 ${!item.enabled ? 'opacity-60' : ''}`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
                  <div className="flex gap-4 flex-1">
                    {item.series?.cover_image_url && (
                      <img
                        src={item.series.cover_image_url}
                        alt={item.series?.title}
                        className="w-20 h-28 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {item.series?.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.series?.synopsis}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleEnabled(item)}
                  >
                    {item.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {sliderItems.length === 0 && (
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              No series in hero slider. Click "Add Series to Slider" to get started.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HeroSliderManagement;
