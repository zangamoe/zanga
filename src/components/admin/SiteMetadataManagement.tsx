import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const SiteMetadataManagement = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    site_title: "",
    site_description: "",
    site_favicon_url: "",
    site_og_image_url: "",
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["site_title", "site_description", "site_favicon_url", "site_og_image_url"]);

      if (error) throw error;
      
      const metadataObj: any = {
        site_title: "",
        site_description: "",
        site_favicon_url: "",
        site_og_image_url: "",
      };
      
      data?.forEach((item) => {
        try {
          const parsed = JSON.parse(String(item.value));
          metadataObj[item.key] = String(parsed);
        } catch {
          metadataObj[item.key] = String(item.value);
        }
      });
      
      setMetadata(metadataObj);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error loading metadata", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: string) => {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value: JSON.stringify(value), type: key.includes('url') ? 'image' : 'text' });

    if (error) {
      toast({ variant: "destructive", title: "Error saving", description: error.message });
    } else {
      toast({ title: "Saved successfully" });
      fetchMetadata();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
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
      toast({ variant: "destructive", title: "Upload failed", description: uploadError.message });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("manga-images")
      .getPublicUrl(filePath);

    await handleSave(key, publicUrl);
    setUploading(false);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Site Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Site Title (Browser Tab)</Label>
            <div className="flex gap-2">
              <Input
                value={metadata.site_title}
                onChange={(e) => setMetadata({ ...metadata, site_title: e.target.value })}
                placeholder="zanga"
              />
              <Button onClick={() => handleSave("site_title", metadata.site_title)}>Save</Button>
            </div>
          </div>

          <div>
            <Label>Site Description (Meta Description for SEO)</Label>
            <div className="flex gap-2">
              <Textarea
                value={metadata.site_description}
                onChange={(e) => setMetadata({ ...metadata, site_description: e.target.value })}
                placeholder="Discover professionally localized manga from aspiring Japanese authors"
                rows={3}
              />
              <Button onClick={() => handleSave("site_description", metadata.site_description)}>Save</Button>
            </div>
          </div>

          <div>
            <Label>Favicon</Label>
            <div className="space-y-2">
              {metadata.site_favicon_url && (
                <img src={metadata.site_favicon_url} alt="Favicon" className="w-16 h-16 object-contain border rounded" />
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "site_favicon_url")}
                  disabled={uploading}
                />
                <Button disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Open Graph Image (Social Sharing Preview)</Label>
            <div className="space-y-2">
              {metadata.site_og_image_url && (
                <img src={metadata.site_og_image_url} alt="OG Image" className="w-full max-w-md h-auto object-contain border rounded" />
              )}
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "site_og_image_url")}
                  disabled={uploading}
                />
                <Button disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteMetadataManagement;
