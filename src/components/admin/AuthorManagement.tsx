import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface Author {
  id: string;
  name: string;
  bio: string | null;
  profile_picture_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  published: boolean;
}

const AuthorManagement = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    profile_picture_url: "",
    twitter_url: "",
    instagram_url: "",
    website_url: "",
    published: true,
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    const { data, error } = await supabase
      .from("authors")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch authors",
        variant: "destructive",
      });
    } else {
      setAuthors(data || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `authors/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
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

      setFormData({ ...formData, profile_picture_url: publicUrl });
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAuthor) {
      const { error } = await supabase
        .from("authors")
        .update(formData)
        .eq("id", editingAuthor.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update author",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Author updated successfully" });
        fetchAuthors();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("authors").insert([formData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create author",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Author created successfully" });
        fetchAuthors();
        resetForm();
      }
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      bio: author.bio || "",
      profile_picture_url: author.profile_picture_url || "",
      twitter_url: author.twitter_url || "",
      instagram_url: author.instagram_url || "",
      website_url: author.website_url || "",
      published: author.published,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this author?")) return;

    const { error } = await supabase.from("authors").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete author",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Author deleted successfully" });
      fetchAuthors();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      bio: "",
      profile_picture_url: "",
      twitter_url: "",
      instagram_url: "",
      website_url: "",
      published: true,
    });
    setEditingAuthor(null);
    setDialogOpen(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Authors</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Author
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
            <DialogHeader>
              <DialogTitle>{editingAuthor ? "Edit Author" : "Add Author"}</DialogTitle>
              <DialogDescription>
                {editingAuthor ? "Update author information" : "Create a new author profile"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Profile Picture</label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="bg-secondary border-border"
                  />
                  {formData.profile_picture_url && (
                    <img
                      src={formData.profile_picture_url}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Twitter URL</label>
                <Input
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/..."
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Instagram URL</label>
                <Input
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Website URL</label>
                <Input
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-secondary border-border"
                />
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

              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-primary flex-1" disabled={uploading}>
                  {editingAuthor ? "Update" : "Create"} Author
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map((author) => (
          <Card key={author.id} className={`bg-gradient-card border-border/50 ${!author.published ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              {author.profile_picture_url && (
                <img
                  src={author.profile_picture_url}
                  alt={author.name}
                  className="w-24 h-24 rounded-full object-cover mb-4 mx-auto"
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg text-center flex-1">{author.name}</h3>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={author.published}
                    onCheckedChange={async (checked) => {
                      const { error } = await supabase
                        .from("authors")
                        .update({ published: checked })
                        .eq("id", author.id);
                      if (!error) {
                        fetchAuthors();
                        toast({
                          title: "Success",
                          description: `Author ${checked ? 'published' : 'hidden'}`,
                        });
                      }
                    }}
                  />
                  {author.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </div>
              </div>
              {author.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{author.bio}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(author)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(author.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AuthorManagement;
