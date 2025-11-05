import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, FileImage, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isValidImgurUrl } from "@/lib/imgurParser";
import { Separator } from "@/components/ui/separator";

interface Chapter {
  id: string;
  series_id: string;
  chapter_number: number;
  title: string;
  published_date: string;
  imgur_album_url?: string | null;
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
    imgur_album_url: "",
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

    // Validate imgur URL if provided
    if (formData.imgur_album_url && !isValidImgurUrl(formData.imgur_album_url)) {
      toast({
        variant: "destructive",
        title: "Invalid imgur URL",
        description: "Please provide a valid imgur album or gallery URL (e.g., https://imgur.com/a/abc123)",
      });
      return;
    }

    if (editingChapter) {
      const { error } = await supabase
        .from("chapters")
        .update({
          chapter_number: parseInt(formData.chapter_number),
          title: formData.title,
          published_date: formData.published_date,
          imgur_album_url: formData.imgur_album_url || null,
        })
        .eq("id", editingChapter.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error updating chapter",
          description: error.message,
        });
      } else {
        // If imgur URL was provided, import images
        if (formData.imgur_album_url) {
          await importImgurAlbum(editingChapter.id, formData.imgur_album_url);
        } else if (pageFiles && pageFiles.length > 0) {
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
          imgur_album_url: formData.imgur_album_url || null,
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
        // If imgur URL was provided, import images
        if (formData.imgur_album_url) {
          await importImgurAlbum(data.id, formData.imgur_album_url);
        } else if (pageFiles && pageFiles.length > 0) {
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

  const importImgurAlbum = async (chapterId: string, imgurUrl: string) => {
    try {
      // Call edge function to parse imgur album
      const { data: parseData, error: parseError } = await supabase.functions.invoke('parse-imgur', {
        body: { imgurUrl }
      });

      if (parseError) throw parseError;
      
      if (!parseData.success) {
        throw new Error(parseData.error || 'Failed to parse imgur album');
      }

      const images = parseData.images;
      
      if (!images || images.length === 0) {
        throw new Error('No images found in album');
      }

      // Clear existing pages
      await supabase
        .from("chapter_pages")
        .delete()
        .eq("chapter_id", chapterId);

      // Insert pages with imgur URLs
      const pagesToInsert = images.map((img: any) => ({
        chapter_id: chapterId,
        page_number: img.page_number,
        image_url: img.url
      }));

      const { error: insertError } = await supabase
        .from("chapter_pages")
        .insert(pagesToInsert);

      if (insertError) throw insertError;

      toast({
        title: `Imported ${images.length} images from imgur`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error importing imgur album",
        description: error.message,
      });
    }
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormData({
      series_id: chapter.series_id,
      chapter_number: chapter.chapter_number.toString(),
      title: chapter.title,
      published_date: chapter.published_date,
      imgur_album_url: chapter.imgur_album_url || "",
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
      imgur_album_url: "",
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

              <Separator className="my-4" />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Imgur Album Link (Recommended)</h4>
                    <p className="text-sm text-muted-foreground">
                      Paste an imgur album URL to load images directly from imgur - no storage needed!
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="imgur_url">Imgur Album URL</Label>
                  <Input
                    id="imgur_url"
                    placeholder="https://imgur.com/a/abc123"
                    value={formData.imgur_album_url}
                    onChange={(e) => setFormData({ ...formData, imgur_album_url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: https://imgur.com/a/ALBUM_ID or https://imgur.com/gallery/GALLERY_ID
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileImage className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-semibold">Or Upload Files</h4>
                    <p className="text-sm text-muted-foreground">
                      Upload images to server storage (imgur is faster)
                    </p>
                  </div>
                </div>
                <Label htmlFor="pages">
                  Chapter Pages {editingChapter && "(Optional - use Manage Pages button)"}
                </Label>
                <Input
                  id="pages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setPageFiles(e.target.files)}
                  disabled={!!formData.imgur_album_url}
                />
                {formData.imgur_album_url && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    File upload disabled when using imgur link
                  </p>
                )}
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">Chapter {chapter.chapter_number}</span>
                          <span className="text-muted-foreground">•</span>
                          <span>{chapter.title}</span>
                          {chapter.imgur_album_url && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                              <LinkIcon className="h-3 w-3" />
                              Imgur
                            </span>
                          )}
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
