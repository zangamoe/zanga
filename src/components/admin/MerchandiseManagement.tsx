import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ImageCropper from "./ImageCropper";

interface Merchandise {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  purchase_url: string | null;
}

const MerchandiseManagement = () => {
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Merchandise | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image_url: "",
    purchase_url: "",
  });

  useEffect(() => {
    fetchMerchandise();
  }, []);

  const fetchMerchandise = async () => {
    const { data, error } = await supabase
      .from("merchandise")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch merchandise",
        variant: "destructive",
      });
    } else {
      setMerchandise(data || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImageUrl(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    setUploading(true);
    const blob = await fetch(croppedImageUrl).then(r => r.blob());
    const fileExt = "jpg";
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `merchandise/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("manga-images")
      .upload(filePath, blob);

    if (uploadError) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      setShowCropper(false);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("manga-images")
      .getPublicUrl(filePath);

    setFormData({ ...formData, image_url: publicUrl });
    toast({ title: "Success", description: "Image uploaded successfully" });
    setShowCropper(false);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      title: formData.title,
      description: formData.description || null,
      price: formData.price ? parseFloat(formData.price) : null,
      image_url: formData.image_url || null,
      purchase_url: formData.purchase_url || null,
    };

    if (editingItem) {
      const { error } = await supabase
        .from("merchandise")
        .update(submitData)
        .eq("id", editingItem.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update merchandise",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Merchandise updated successfully" });
        fetchMerchandise();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("merchandise").insert([submitData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create merchandise",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Merchandise created successfully" });
        fetchMerchandise();
        resetForm();
      }
    }
  };

  const handleEdit = (item: Merchandise) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      price: item.price?.toString() || "",
      image_url: item.image_url || "",
      purchase_url: item.purchase_url || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const { error } = await supabase.from("merchandise").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete merchandise",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Merchandise deleted successfully" });
      fetchMerchandise();
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      image_url: "",
      purchase_url: "",
    });
    setEditingItem(null);
    setDialogOpen(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Merchandise</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Merchandise
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Merchandise" : "Add Merchandise"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Update merchandise information" : "Create a new merchandise item"}
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
                <label className="text-sm font-medium">Image</label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="bg-secondary border-border"
                  />
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Price (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="29.99"
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Purchase URL</label>
                <Input
                  value={formData.purchase_url}
                  onChange={(e) => setFormData({ ...formData, purchase_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-secondary border-border"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-gradient-primary flex-1" disabled={uploading}>
                  {editingItem ? "Update" : "Create"} Merchandise
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
        {merchandise.map((item) => (
          <Card key={item.id} className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
              )}
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {item.description}
                </p>
              )}
              {item.price && (
                <p className="text-lg font-bold mb-4">${item.price.toFixed(2)}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showCropper && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
          aspectRatio={1}
        />
      )}
    </div>
  );
};

export default MerchandiseManagement;
