import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const AllChapters = () => {
  const { id } = useParams();
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchSeriesAndChapters();
  }, [id]);

  const fetchSeriesAndChapters = async () => {
    const { data } = await supabase
      .from("series")
      .select(`
        *,
        chapters(id, chapter_number, title, published_date)
      `)
      .eq("id", id)
      .single();

    if (data) {
      setSeries({
        ...data,
        chapters: data.chapters?.sort((a: any, b: any) => b.chapter_number - a.chapter_number) || [],
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Series not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to={`/series/${id}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Series
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">All Chapters</h1>
          <p className="text-muted-foreground">
            {series.chapters.length} chapters available! Looking for {series.title}?
          </p>
        </div>

        {/* All Chapters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {series.chapters.map((chapter: any, index: number) => (
            <Card 
              key={chapter.id} 
              className="hover:shadow-glow transition-all duration-300 bg-card/50 border-border/50 group relative overflow-hidden"
            >
              {index === 0 && (
                <Badge className="absolute top-3 right-3 bg-gradient-primary z-10">NEW</Badge>
              )}
              <CardContent className="p-6">
                <Link to={`/read/${id}/${chapter.chapter_number}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-5xl font-bold text-muted-foreground/20">
                      {chapter.chapter_number}
                    </div>
                    <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2 mb-1">
                        Chapter {chapter.chapter_number}
                      </h3>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide line-clamp-2">
                        {chapter.title}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/30">
                      <Calendar className="h-4 w-4" />
                      {new Date(chapter.published_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {series.chapters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No chapters available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllChapters;
