import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";
import ImageCropper from "./ImageCropper";

interface SpecificAuthorEditorProps {
  authorId: string;
  onBack: () => void;
}

const SpecificAuthorEditor = ({ authorId, onBack }: SpecificAuthorEditorProps) => {
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    fetchAuthor();
    fetchAuthorSeries();
  }, [authorId]);

  const fetchAuthor = async () => {
    const { data } = await supabase
      .from("authors")
      .select("*")
      .eq("id", authorId)
      .single();

    if (data) {
      setAuthor(data);
    }
    setLoading(false);
  };

  const fetchAuthorSeries = async () => {
    const { data } = await supabase
      .from("series_authors")
      .select(`
        series (
          id,
          title,
          cover_image_url
        )
      `)
      .eq("author_id", authorId);

    if (data) {
      setSeries(data.map((item: any) => item.series));
    }
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
    const filePath = `authors/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("manga-images")
      .upload(filePath, blob);

    if (uploadError) {
      toast.error("Failed to upload image");
      setShowCropper(false);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("manga-images")
      .getPublicUrl(filePath);

    setAuthor({ ...author, profile_picture_url: publicUrl });
    toast.success("Image uploaded successfully");
    setShowCropper(false);
    setUploading(false);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from("authors")
      .update({
        name: author.name,
        bio: author.bio,
        profile_picture_url: author.profile_picture_url,
        twitter_url: author.twitter_url,
        instagram_url: author.instagram_url,
        website_url: author.website_url,
        published: author.published,
      })
      .eq("id", authorId);

    if (error) {
      toast.error("Failed to save author info");
    } else {
      toast.success("Author info updated successfully");
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (!author) {
    return <div className="text-center py-4">Author not found</div>;
  }

  return (
    <div className="space-y-6">
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Authors List
      </Button>

      <div>
        <h2 className="text-2xl font-bold mb-2">{author.name}</h2>
        <p className="text-muted-foreground">Edit all content for this author</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Author Info</TabsTrigger>
          <TabsTrigger value="works">Works</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Author Information</CardTitle>
              <CardDescription>Edit the author's profile and social media links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={author.name}
                  onChange={(e) => setAuthor({ ...author, name: e.target.value })}
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={author.bio || ""}
                  onChange={(e) => setAuthor({ ...author, bio: e.target.value })}
                  className="bg-secondary border-border"
                  rows={5}
                  placeholder="Write about this author..."
                />
              </div>

              <div>
                <Label>Profile Picture</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="bg-secondary border-border"
                  />
                  {author.profile_picture_url && (
                    <img
                      src={author.profile_picture_url}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-full"
                    />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  value={author.twitter_url || ""}
                  onChange={(e) => setAuthor({ ...author, twitter_url: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={author.instagram_url || ""}
                  onChange={(e) => setAuthor({ ...author, instagram_url: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  value={author.website_url || ""}
                  onChange={(e) => setAuthor({ ...author, website_url: e.target.value })}
                  className="bg-secondary border-border"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Published (Visible on website)</Label>
                <Switch
                  checked={author.published}
                  onCheckedChange={(checked) => setAuthor({ ...author, published: checked })}
                />
              </div>

              <Button onClick={handleSave} className="bg-gradient-primary hover:opacity-90">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="works">
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle>Author's Works</CardTitle>
              <CardDescription>
                Series by this author (manage series assignments in the Series section)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {series.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No series assigned to this author yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {series.map((s: any) => (
                    <Card key={s.id} className="bg-secondary/50 border-border/30">
                      <CardContent className="p-4 flex items-center gap-4">
                        {s.cover_image_url && (
                          <img
                            src={s.cover_image_url}
                            alt={s.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold">{s.title}</h4>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

export default SpecificAuthorEditor;
