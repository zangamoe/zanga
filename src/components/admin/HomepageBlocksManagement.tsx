import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface HomepageBlock {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  excerpt: string | null;
  enabled: boolean;
  origin: "auto" | "manual";
  order_index: number;
  created_at: string;
  updated_at: string;
}

const HomepageBlocksManagement = () => {
  const [blocks, setBlocks] = useState<HomepageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<HomepageBlock | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    excerpt: "",
    enabled: true,
    origin: "manual" as "auto" | "manual",
    order_index: 0,
  });

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    const { data, error } = await supabase
      .from("homepage_blocks")
      .select("*")
      .order("order_index");

    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching blocks",
        description: error.message,
      });
    } else {
      setBlocks((data || []) as HomepageBlock[]);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("manga-images")
      .upload(filePath, file);

    if (uploadError) {
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: uploadError.message,
      });
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from("manga-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast({
        title: "Image uploaded",
        description: "Image uploaded successfully",
      });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingBlock) {
      const { error } = await supabase
        .from("homepage_blocks")
        .update(formData)
        .eq("id", editingBlock.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error updating block",
          description: error.message,
        });
      } else {
        toast({ title: "Block updated successfully" });
        fetchBlocks();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from("homepage_blocks")
        .insert({ ...formData, order_index: blocks.length });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error creating block",
          description: error.message,
        });
      } else {
        toast({ title: "Block created successfully" });
        fetchBlocks();
        resetForm();
      }
    }
  };

  const handleEdit = (block: HomepageBlock) => {
    setEditingBlock(block);
    setFormData({
      title: block.title,
      subtitle: block.subtitle || "",
      image_url: block.image_url || "",
      link_url: block.link_url || "",
      excerpt: block.excerpt || "",
      enabled: block.enabled,
      origin: block.origin,
      order_index: block.order_index,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this block?")) return;

    const { error } = await supabase
      .from("homepage_blocks")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error deleting block",
        description: error.message,
      });
    } else {
      toast({ title: "Block deleted successfully" });
      fetchBlocks();
    }
  };

  const toggleEnabled = async (block: HomepageBlock) => {
    const { error } = await supabase
      .from("homepage_blocks")
      .update({ enabled: !block.enabled })
      .eq("id", block.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating block",
        description: error.message,
      });
    } else {
      fetchBlocks();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      excerpt: "",
      enabled: true,
      origin: "manual",
      order_index: 0,
    });
    setEditingBlock(null);
    setDialogOpen(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Manage homepage featured blocks. Drag to reorder, toggle to enable/disable.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>Add Block</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBlock ? "Edit Block" : "Add Block"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="mt-2 max-w-xs rounded"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/series/123"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
                <Label htmlFor="enabled">Enabled</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : editingBlock ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {blocks.map((block) => (
          <Card key={block.id} className={`bg-gradient-card border-border/50 ${!block.enabled ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 flex-1">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{block.title}</CardTitle>
                      <Badge variant={block.origin === "auto" ? "secondary" : "default"}>
                        {block.origin}
                      </Badge>
                    </div>
                    {block.subtitle && (
                      <CardDescription>{block.subtitle}</CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleEnabled(block)}
                  >
                    {block.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(block)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(block.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {(block.image_url || block.excerpt) && (
              <CardContent>
                <div className="flex gap-4">
                  {block.image_url && (
                    <img
                      src={block.image_url}
                      alt={block.title}
                      className="w-32 h-32 object-cover rounded"
                    />
                  )}
                  {block.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                      {block.excerpt}
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomepageBlocksManagement;
