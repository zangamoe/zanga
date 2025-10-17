import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";

interface Section {
  id: string;
  title: string;
  section_type: string;
  filter_criteria: {
    genre_id?: string;
  };
  order_index: number;
  enabled: boolean;
}

interface Genre {
  id: string;
  name: string;
}

const HomepageSectionsManagement = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSection, setNewSection] = useState({
    title: "",
    section_type: "latest",
    filter_criteria: {},
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [sectionsRes, genresRes] = await Promise.all([
      supabase.from("homepage_sections").select("*").order("order_index"),
      supabase.from("genres").select("*").order("name"),
    ]);

    if (sectionsRes.error) {
      toast({ variant: "destructive", title: "Error loading sections", description: sectionsRes.error.message });
    } else {
      setSections((sectionsRes.data || []).map(s => ({
        ...s,
        filter_criteria: (s.filter_criteria as any) || {}
      })));
    }

    if (genresRes.error) {
      toast({ variant: "destructive", title: "Error loading genres", description: genresRes.error.message });
    } else {
      setGenres(genresRes.data || []);
    }

    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newSection.title) {
      toast({ variant: "destructive", title: "Please enter a section title" });
      return;
    }

    const { error } = await supabase.from("homepage_sections").insert({
      title: newSection.title,
      section_type: newSection.section_type,
      filter_criteria: newSection.filter_criteria,
      order_index: sections.length,
      enabled: true,
    });

    if (error) {
      toast({ variant: "destructive", title: "Error adding section", description: error.message });
    } else {
      toast({ title: "Section added" });
      setNewSection({ title: "", section_type: "latest", filter_criteria: {} });
      fetchData();
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Section>) => {
    const { error } = await supabase.from("homepage_sections").update(updates).eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error updating section", description: error.message });
    } else {
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;

    const { error } = await supabase.from("homepage_sections").delete().eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Error deleting section", description: error.message });
    } else {
      toast({ title: "Section deleted" });
      fetchData();
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const updatedSections = [...sections];
    const [moved] = updatedSections.splice(index, 1);
    updatedSections.splice(newIndex, 0, moved);

    const updates = updatedSections.map((section, idx) => ({
      id: section.id,
      order_index: idx,
    }));

    for (const update of updates) {
      await supabase.from("homepage_sections").update({ order_index: update.order_index }).eq("id", update.id);
    }

    fetchData();
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Add New Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              placeholder="e.g., Latest Releases, Popular Series, Shonen Manga"
            />
          </div>
          <div>
            <Label>Section Type</Label>
            <Select
              value={newSection.section_type}
              onValueChange={(value) => {
                const filter = value === "genre" ? { genre_id: genres[0]?.id || "" } : {};
                setNewSection({ ...newSection, section_type: value, filter_criteria: filter });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest Releases</SelectItem>
                <SelectItem value="popular">Popular (By Ratings)</SelectItem>
                <SelectItem value="genre">Genre-Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {newSection.section_type === "genre" && (
            <div>
              <Label>Select Genre</Label>
              <Select
                value={(newSection.filter_criteria as any)?.genre_id || ""}
                onValueChange={(value) =>
                  setNewSection({
                    ...newSection,
                    filter_criteria: { genre_id: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Homepage Sections</h3>
        {sections.map((section, index) => (
          <Card key={section.id} className={`bg-gradient-card border-border/50 ${!section.enabled ? "opacity-60" : ""}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <span className="text-sm text-muted-foreground">({section.section_type})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleMove(index, "up")} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleMove(index, "down")} disabled={index === sections.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleUpdate(section.id, { enabled: !section.enabled })}>
                    {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(section.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={section.title} onChange={(e) => handleUpdate(section.id, { title: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomepageSectionsManagement;
