import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, BookOpen, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

interface Series {
  id: string;
  title: string;
  cover_image_url: string;
  synopsis: string;
  status: string;
  published: boolean;
  ratings_enabled: boolean;
}

interface Author {
  id: string;
  name: string;
}

interface Genre {
  id: string;
  name: string;
}

const SeriesManagement = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    cover_image_url: "",
    synopsis: "",
    status: "ongoing" as "ongoing" | "completed" | "hiatus",
    published: true,
    ratings_enabled: true,
  });

  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [seriesData, authorsData, genresData] = await Promise.all([
      supabase.from("series").select("*").order("title"),
      supabase.from("authors").select("*").order("name"),
      supabase.from("genres").select("*").order("name"),
    ]);

    if (seriesData.data) setSeries(seriesData.data);
    if (authorsData.data) setAuthors(authorsData.data);
    if (genresData.data) setGenres(genresData.data);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("manga-images")
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from("manga-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, cover_image_url: publicUrl });
      toast({ title: "Success", description: "Image uploaded successfully" });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSeries) {
      const { error } = await supabase
        .from("series")
        .update(formData)
        .eq("id", editingSeries.id);

      if (!error) {
        await updateRelations(editingSeries.id);
        toast({ title: "Success", description: "Series updated successfully" });
        fetchData();
        resetForm();
      } else {
        toast({
          title: "Error",
          description: "Failed to update series",
          variant: "destructive",
        });
      }
    } else {
      const { data, error } = await supabase.from("series").insert([formData]).select().single();

      if (!error && data) {
        await updateRelations(data.id);
        toast({ title: "Success", description: "Series created successfully" });
        fetchData();
        resetForm();
      } else {
        toast({
          title: "Error",
          description: "Failed to create series",
          variant: "destructive",
        });
      }
    }
  };

  const updateRelations = async (seriesId: string) => {
    // Update authors
    await supabase.from("series_authors").delete().eq("series_id", seriesId);
    if (selectedAuthors.length > 0) {
      await supabase
        .from("series_authors")
        .insert(selectedAuthors.map((authorId) => ({ series_id: seriesId, author_id: authorId })));
    }

    // Update genres
    await supabase.from("series_genres").delete().eq("series_id", seriesId);
    if (selectedGenres.length > 0) {
      await supabase
        .from("series_genres")
        .insert(selectedGenres.map((genreId) => ({ series_id: seriesId, genre_id: genreId })));
    }
  };

  const handleEdit = async (series: Series) => {
    setEditingSeries(series);
    setFormData({
      title: series.title,
      cover_image_url: series.cover_image_url,
      synopsis: series.synopsis,
      status: series.status as any,
      published: series.published,
      ratings_enabled: series.ratings_enabled ?? true,
    });

    // Fetch related authors and genres
    const [authorsData, genresData] = await Promise.all([
      supabase.from("series_authors").select("author_id").eq("series_id", series.id),
      supabase.from("series_genres").select("genre_id").eq("series_id", series.id),
    ]);

    setSelectedAuthors(authorsData.data?.map((a) => a.author_id) || []);
    setSelectedGenres(genresData.data?.map((g) => g.genre_id) || []);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this series?")) return;

    const { error } = await supabase.from("series").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete series",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Series deleted successfully" });
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      cover_image_url: "",
      synopsis: "",
      status: "ongoing",
      published: true,
      ratings_enabled: true,
    });
    setSelectedAuthors([]);
    setSelectedGenres([]);
    setEditingSeries(null);
    setDialogOpen(false);
  };

  const toggleAuthor = (authorId: string) => {
    setSelectedAuthors((prev) =>
      prev.includes(authorId) ? prev.filter((id) => id !== authorId) : [...prev, authorId]
    );
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Series</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Series
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
            <DialogHeader>
              <DialogTitle>{editingSeries ? "Edit Series" : "Add Series"}</DialogTitle>
              <DialogDescription>
                {editingSeries ? "Update series information" : "Create a new manga series"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="text-sm font-medium">Cover Image *</label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="bg-secondary border-border"
                  />
                  {formData.cover_image_url && (
                    <img
                      src={formData.cover_image_url}
                      alt="Preview"
                      className="w-32 h-48 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Synopsis *</label>
                <Textarea
                  value={formData.synopsis}
                  onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                  rows={4}
                  required
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Status *</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="hiatus">Hiatus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Authors</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded p-3 bg-secondary">
                  {authors.map((author) => (
                    <div key={author.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`author-${author.id}`}
                        checked={selectedAuthors.includes(author.id)}
                        onCheckedChange={() => toggleAuthor(author.id)}
                      />
                      <label htmlFor={`author-${author.id}`} className="text-sm cursor-pointer">
                        {author.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Genres</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded p-3 bg-secondary">
                  {genres.map((genre) => (
                    <div key={genre.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`genre-${genre.id}`}
                        checked={selectedGenres.includes(genre.id)}
                        onCheckedChange={() => toggleGenre(genre.id)}
                      />
                      <label htmlFor={`genre-${genre.id}`} className="text-sm cursor-pointer">
                        {genre.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Published (Visible on website)</label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                  />
                  {formData.published ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Star Ratings</label>
                <Switch
                  checked={formData.ratings_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, ratings_enabled: checked })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-primary flex-1" disabled={uploading}>
                  {editingSeries ? "Update" : "Create"} Series
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {series.map((item) => (
          <Card key={item.id} className={`bg-gradient-card border-border/50 overflow-hidden ${!item.published ? 'opacity-60' : ''}`}>
            <div className="flex gap-4 p-4">
              <img
                src={item.cover_image_url}
                alt={item.title}
                className="w-24 h-32 object-cover rounded"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.published}
                      onCheckedChange={async (checked) => {
                        const { error } = await supabase
                          .from("series")
                          .update({ published: checked })
                          .eq("id", item.id);
                        if (!error) {
                          fetchData();
                          toast({
                            title: "Success",
                            description: `Series ${checked ? 'published' : 'hidden'}`,
                          });
                        }
                      }}
                    />
                    {item.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.synopsis}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Series
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/admin/series/${item.id}/chapters`)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Chapters
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SeriesManagement;
