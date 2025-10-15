import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChapterPageEditor from "@/components/admin/ChapterPageEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  series: {
    title: string;
  };
}

const ManageChapter = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChapter();
  }, [chapterId]);

  const fetchChapter = async () => {
    if (!chapterId) return;

    const { data, error } = await supabase
      .from("chapters")
      .select(`
        *,
        series:series_id (
          title
        )
      `)
      .eq("id", chapterId)
      .single();

    if (!error && data) {
      setChapter(data as any);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Chapter not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Manage Chapter Pages
          </h1>
          <p className="text-muted-foreground text-lg">
            {chapter.series?.title} - Chapter {chapter.chapter_number}: {chapter.title}
          </p>
        </div>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Chapter Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {chapterId && (
              <ChapterPageEditor 
                chapterId={chapterId} 
                onClose={() => navigate("/admin")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageChapter;
