import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Pencil, Search, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SiteSetting {
  id: string;
  key: string;
  value: any;
  type: "text" | "html" | "image" | "json";
  last_updated: string;
}

const SiteContentManagement = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SiteSetting | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    type: "text" as "text" | "html" | "image" | "json",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("key");

    if (error) {
      toast({
        variant: "destructive",
        title: "Error fetching settings",
        description: error.message,
      });
    } else {
      setSettings((data || []) as SiteSetting[]);
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

    const { error: uploadError, data } = await supabase.storage
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

      setFormData({ ...formData, value: publicUrl });
      toast({
        title: "Image uploaded",
        description: "Image uploaded successfully",
      });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const settingData = {
      key: formData.key,
      value: JSON.stringify(formData.value),
      type: formData.type,
    };

    if (editingSetting) {
      const { error } = await supabase
        .from("site_settings")
        .update(settingData)
        .eq("id", editingSetting.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error updating setting",
          description: error.message,
        });
      } else {
        toast({ title: "Setting updated successfully" });
        fetchSettings();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from("site_settings")
        .insert(settingData);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error creating setting",
          description: error.message,
        });
      } else {
        toast({ title: "Setting created successfully" });
        fetchSettings();
        resetForm();
      }
    }
  };

  const handleEdit = (setting: SiteSetting) => {
    setEditingSetting(setting);
    let parsedValue = setting.value;
    if (typeof setting.value === 'string') {
      try {
        parsedValue = JSON.parse(setting.value);
      } catch {
        parsedValue = setting.value;
      }
    }
    setFormData({
      key: setting.key,
      value: parsedValue,
      type: setting.type,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ key: "", value: "", type: "text" });
    setEditingSetting(null);
    setDialogOpen(false);
  };

  const filteredSettings = settings.filter((setting) =>
    setting.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>Add Setting</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSetting ? "Edit Setting" : "Add Setting"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="e.g., site_title, home_hero_title"
                  required
                  disabled={!!editingSetting}
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === "image" ? (
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {formData.value && (
                    <img
                      src={formData.value}
                      alt="Preview"
                      className="mt-2 max-w-xs rounded"
                    />
                  )}
                </div>
              ) : formData.type === "html" ? (
                <div>
                  <Label htmlFor="value">HTML Content</Label>
                  <Textarea
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : editingSetting ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {filteredSettings.map((setting) => (
          <Card key={setting.id} className="bg-gradient-card border-border/50">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{setting.key}</CardTitle>
                  <CardDescription>
                    Type: {setting.type} | Last updated: {new Date(setting.last_updated).toLocaleString()}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(setting)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {setting.type === "image" ? (
                <img
                  src={(() => {
                    if (typeof setting.value === 'string') {
                      try {
                        return JSON.parse(setting.value);
                      } catch {
                        return setting.value;
                      }
                    }
                    return setting.value;
                  })()}
                  alt={setting.key}
                  className="max-w-xs rounded"
                />
              ) : (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {(() => {
                    if (typeof setting.value === 'string') {
                      try {
                        return JSON.parse(setting.value);
                      } catch {
                        return setting.value;
                      }
                    }
                    return String(setting.value);
                  })()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SiteContentManagement;
