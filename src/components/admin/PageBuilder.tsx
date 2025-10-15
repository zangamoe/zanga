import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus, GripVertical, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PageSection {
  id: string;
  section_type: string;
  title: string;
  content: string;
  order_index: number;
  enabled: boolean;
}

const PageBuilder = () => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSection, setNewSection] = useState({
    section_type: "text",
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from("page_sections")
      .select("*")
      .order("order_index");

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading sections",
        description: error.message,
      });
    } else {
      setSections(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newSection.title) {
      toast({
        variant: "destructive",
        title: "Please enter a section title",
      });
      return;
    }

    const { error } = await supabase
      .from("page_sections")
      .insert({
        section_type: newSection.section_type,
        title: newSection.title,
        content: newSection.content,
        order_index: sections.length,
        enabled: true,
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error adding section",
        description: error.message,
      });
    } else {
      toast({ title: "Section added" });
      setNewSection({ section_type: "text", title: "", content: "" });
      fetchSections();
    }
  };

  const handleUpdate = async (id: string, updates: Partial<PageSection>) => {
    const { error } = await supabase
      .from("page_sections")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating section",
        description: error.message,
      });
    } else {
      fetchSections();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this section?")) return;

    const { error } = await supabase
      .from("page_sections")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error deleting section",
        description: error.message,
      });
    } else {
      toast({ title: "Section deleted" });
      fetchSections();
    }
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
            <Label>Section Type</Label>
            <Select
              value={newSection.section_type}
              onValueChange={(value) => setNewSection({ ...newSection, section_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Content</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="grid">Grid Layout</SelectItem>
                <SelectItem value="hero">Hero Banner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Section Title</Label>
            <Input
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              placeholder="e.g., About Us"
            />
          </div>
          <div>
            <Label>Content</Label>
            <Textarea
              value={newSection.content}
              onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
              placeholder="Section content or configuration (JSON)"
              rows={4}
            />
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Page Sections</h3>
        {sections.map((section) => (
          <Card key={section.id} className={`bg-gradient-card border-border/50 ${!section.enabled ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdate(section.id, { enabled: !section.enabled })}
                  >
                    {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Type: {section.section_type}</Label>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={section.title}
                  onChange={(e) => handleUpdate(section.id, { title: e.target.value })}
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={section.content}
                  onChange={(e) => handleUpdate(section.id, { content: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PageBuilder;
