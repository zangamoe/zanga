import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const ChapterManagement = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pageFiles, setPageFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    series_id: "",
    chapter_number: 1,
    title: "",
    published_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [chaptersData, seriesData] = await Promise.all([
      supabase.from("chapters").select("*").order("series_id").order("chapter_number", { ascending: false }),
      supabase.from("series").select("id, title").order("title"),
    ]);

    if (chaptersData.data) setChapters(chaptersData.data);
    if (seriesData.data) setSeries(seriesData.data);
    setLoading(false);
  };

  const handlePageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPageFiles(files);
  };

  const uploadPages = async (chapterId: string) => {
    if (pageFiles.length === 0) return;

    setUploading(true);

    for (let i = 0; i < pageFiles.length; i++) {
      const file = pageFiles[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `pages/${chapterId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("manga-images")
        .upload(filePath, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("manga-images")
          .getPublicUrl(filePath);

        await supabase.from("chapter_pages").insert([{
          chapter_id: chapterId,
          page_number: i + 1,
          image_url: publicUrl,
        }]);
      }
    }

    setUploading(false);
    toast({ title: "Success", description: "Pages uploaded successfully" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingChapter) {
      const { error } = await supabase
        .from("chapters")
        .update({
          chapter_number: formData.chapter_number,
          title: formData.title,
          published_date: formData.published_date,
        })
        .eq("id", editingChapter.id);

      if (!error) {
        if (pageFiles.length > 0) {
          await supabase.from("chapter_pages").delete().eq("chapter_id", editingChapter.id);
          await uploadPages(editingChapter.id);
        }
        toast({ title: "Success", description: "Chapter updated successfully" });
        fetchData();
        resetForm();
      } else {
        toast({
          title: "Error",
          description: "Failed to update chapter",
          variant: "destructive",
        });
      }
    } else {
      const { data, error } = await supabase.from("chapters").insert([formData]).select().single();

      if (!error && data) {
        await uploadPages(data.id);
        toast({ title: "Success", description: "Chapter created successfully" });
        fetchData();
        resetForm();
      } else {
        toast({
          title: "Error",
          description: "Failed to create chapter",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormData({
      series_id: chapter.series_id,
      chapter_number: chapter.chapter_number,
      title: chapter.title,
      published_date: chapter.published_date,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;

    const { error } = await supabase.from("chapters").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete chapter",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Chapter deleted successfully" });
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      series_id: "",
      chapter_number: 1,
      title: "",
      published_date: new Date().toISOString().split("T")[0],
    });
    setPageFiles([]);
    setEditingChapter(null);
    setDialogOpen(false);
  };

  const getSeriesTitle = (seriesId: string) => {
    return series.find((s) => s.id === seriesId)?.title || "Unknown Series";
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Chapters</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Chapter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
            <DialogHeader>
              <DialogTitle>{editingChapter ? "Edit Chapter" : "Add Chapter"}</DialogTitle>
              <DialogDescription>
                {editingChapter ? "Update chapter information" : "Create a new chapter"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Series *</label>
                <Select
                  value={formData.series_id}
                  onValueChange={(value) => setFormData({ ...formData, series_id: value })}
                  disabled={!!editingChapter}
                >
                  <SelectTrigger className="bg-secondary border-border">
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

              <div>
                <label className="text-sm font-medium">Chapter Number *</label>
                <Input
                  type="number"
                  value={formData.chapter_number}
                  onChange={(e) =>
                    setFormData({ ...formData, chapter_number: parseInt(e.target.value) })
                  }
                  required
                  min="1"
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Published Date *</label>
                <Input
                  type="date"
                  value={formData.published_date}
                  onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                  required
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Chapter Pages {editingChapter && "(Optional - leave empty to keep existing pages)"}</label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePageFilesChange}
                  disabled={uploading}
                  className="bg-secondary border-border"
                />
                {pageFiles.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {pageFiles.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-primary flex-1" disabled={uploading || !formData.series_id}>
                  {uploading ? "Uploading..." : editingChapter ? "Update" : "Create"} Chapter
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {chapters.map((chapter) => (
          <Card key={chapter.id} className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {getSeriesTitle(chapter.series_id)} - Chapter {chapter.chapter_number}
                  </h3>
                  <p className="text-sm text-muted-foreground">{chapter.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Published: {new Date(chapter.published_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(chapter)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(chapter.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChapterManagement;
