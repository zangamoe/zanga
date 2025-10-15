import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, FileImage, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Chapter {
  id: string;
  series_id: string;
  chapter_number: number;
  title: string;
  published_date: string;
}

interface Series {
  id: string;
  title: string;
}

interface ChapterManagementProps {
  seriesId?: string;
}

const ChapterManagement = ({ seriesId }: ChapterManagementProps) => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    series_id: "",
    chapter_number: "",
    title: "",
    published_date: new Date().toISOString().split('T')[0],
  });
  const [pageFiles, setPageFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const query = supabase
      .from("chapters")
      .select("*")
      .order("series_id")
      .order("chapter_number", { ascending: false });
    
    if (seriesId) {
      query.eq("series_id", seriesId);
    }

    const { data: chaptersData, error: chaptersError } = await query;

    if (chaptersError) {
      toast({
        variant: "destructive",
        title: "Error fetching chapters",
        description: chaptersError.message,
      });
    } else {
      setChapters(chaptersData || []);
    }

    const { data: seriesData, error: seriesError } = await supabase
      .from("series")
      .select("*")
      .order("title");

    if (seriesError) {
      toast({
        variant: "destructive",
        title: "Error fetching series",
        description: seriesError.message,
      });
    } else {
      setSeries(seriesData || []);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingChapter) {
      const { error } = await supabase
        .from("chapters")
        .update({
          chapter_number: parseInt(formData.chapter_number),
          title: formData.title,
          published_date: formData.published_date,
        })
        .eq("id", editingChapter.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error updating chapter",
          description: error.message,
        });
      } else {
        if (pageFiles && pageFiles.length > 0) {
          await uploadPages(editingChapter.id);
        }
        toast({ title: "Chapter updated successfully" });
        fetchData();
        resetForm();
      }
    } else {
      const { data, error } = await supabase
        .from("chapters")
        .insert({
          series_id: formData.series_id,
          chapter_number: parseInt(formData.chapter_number),
          title: formData.title,
          published_date: formData.published_date,
        })
        .select()
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error creating chapter",
          description: error.message,
        });
      } else {
        if (pageFiles && pageFiles.length > 0) {
          await uploadPages(data.id);
        }
        toast({ title: "Chapter created successfully" });
        fetchData();
        resetForm();
      }
    }
  };

  const uploadPages = async (chapterId: string) => {
    if (!pageFiles) return;

    for (let i = 0; i < pageFiles.length; i++) {
      const file = pageFiles[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${chapterId}-page-${i + 1}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("manga-images")
        .upload(fileName, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("manga-images")
          .getPublicUrl(fileName);

        await supabase.from("chapter_pages").insert({
          chapter_id: chapterId,
          page_number: i + 1,
          image_url: publicUrl,
        });
      }
    }
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormData({
      series_id: chapter.series_id,
      chapter_number: chapter.chapter_number.toString(),
      title: chapter.title,
      published_date: chapter.published_date,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;

    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error deleting chapter",
        description: error.message,
      });
    } else {
      toast({ title: "Chapter deleted successfully" });
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      series_id: seriesId || "",
      chapter_number: "",
      title: "",
      published_date: new Date().toISOString().split('T')[0],
    });
    setEditingChapter(null);
    setPageFiles(null);
    setDialogOpen(false);
  };

  const getSeriesTitle = (seriesId: string) => {
    return series.find((s) => s.id === seriesId)?.title || "Unknown Series";
  };

  const filteredChapters = selectedSeriesFilter === "all" 
    ? chapters 
    : chapters.filter(c => c.series_id === selectedSeriesFilter);

  const groupedChapters = filteredChapters.reduce((acc, chapter) => {
    if (!acc[chapter.series_id]) {
      acc[chapter.series_id] = [];
    }
    acc[chapter.series_id].push(chapter);
    return acc;
  }, {} as Record<string, Chapter[]>);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }


  return (
    <div className="space-y-6">
      {!seriesId && (
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1">
            <Label>Filter by Series</Label>
            <Select value={selectedSeriesFilter} onValueChange={setSelectedSeriesFilter}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Series</SelectItem>
                {series.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>Add Chapter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingChapter ? "Edit Chapter" : "Add Chapter"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!seriesId && (
                <div>
                  <Label htmlFor="series">Series</Label>
                  <Select
                    value={formData.series_id}
                    onValueChange={(value) => setFormData({ ...formData, series_id: value })}
                    disabled={!!editingChapter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a series" />
                    </SelectTrigger>
                    <SelectContent>
                      {series.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="chapter_number">Chapter Number</Label>
                <Input
                  id="chapter_number"
                  type="number"
                  value={formData.chapter_number}
                  onChange={(e) => setFormData({ ...formData, chapter_number: e.target.value })}
                  required
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="published_date">Published Date</Label>
                <Input
                  id="published_date"
                  type="date"
                  value={formData.published_date}
                  onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="pages">
                  Chapter Pages {editingChapter && "(Optional - use Pages button to manage)"}
                </Label>
                <Input
                  id="pages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setPageFiles(e.target.files)}
                />
                {pageFiles && pageFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {pageFiles.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingChapter ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedChapters).map(([seriesId, seriesChapters]) => (
          <Card key={seriesId} className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">{getSeriesTitle(seriesId)}</CardTitle>
              <CardDescription>{seriesChapters.length} chapter(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {seriesChapters
                  .sort((a, b) => a.chapter_number - b.chapter_number)
                  .map((chapter) => (
                    <div
                      key={chapter.id}
                      className="flex justify-between items-center p-4 border border-border/50 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Chapter {chapter.chapter_number}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>{chapter.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Published: {new Date(chapter.published_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/chapter/${chapter.id}`)}
                        >
                          <FileImage className="h-4 w-4 mr-2" />
                          Manage Pages
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(chapter)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(chapter.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {Object.keys(groupedChapters).length === 0 && (
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="py-8 text-center text-muted-foreground">
              No chapters found. {selectedSeriesFilter !== "all" ? "Try selecting a different series or " : ""}Click "Add Chapter" to create one.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChapterManagement;
