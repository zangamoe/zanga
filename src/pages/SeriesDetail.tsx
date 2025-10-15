import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SeriesDetail = () => {
  const { id } = useParams();
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchSeries();
  }, [id]);

  const fetchSeries = async () => {
    const { data } = await supabase
      .from("series")
      .select(`
        *,
        series_authors(author:authors(id, name)),
        series_genres(genre:genres(name)),
        chapters(id, chapter_number, title, published_date)
      `)
      .eq("id", id)
      .single();

    if (data) {
      setSeries({
        ...data,
        authors: data.series_authors?.map((sa: any) => sa.author) || [],
        genres: data.series_genres?.map((sg: any) => sg.genre.name) || [],
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

  const displaySeries = series;

  if (!displaySeries) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Series not found</h1>
        </div>
      </div>
    );
  }

  const statusColors = {
    ongoing: "bg-green-500/20 text-green-400 border-green-500/50",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    hiatus: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Cover Image */}
            <div className="lg:col-span-1">
            <div className="sticky top-24">
              <img
                src={displaySeries.cover_image_url || displaySeries.cover}
                alt={displaySeries.title}
                className="w-full rounded-lg shadow-glow"
              />
            </div>
          </div>

          {/* Series Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {displaySeries.title}
                </h1>
                <Badge className={statusColors[displaySeries.status as keyof typeof statusColors]} variant="outline">
                  {displaySeries.status}
                </Badge>
              </div>
              
              <div className="text-muted-foreground mb-4">
                By {displaySeries.authors?.length > 0 ? (
                  displaySeries.authors.map((author: any, index: number) => (
                    <span key={author.id}>
                      <Link to={`/authors/${author.id}`} className="text-primary hover:underline font-semibold">
                        {author.name}
                      </Link>
                      {index < displaySeries.authors.length - 1 && ", "}
                    </span>
                  ))
                ) : (
                  <span className="text-foreground font-semibold">{displaySeries.author}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {displaySeries.genres?.map((genre: string) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="bg-secondary/30 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {displaySeries.synopsis}
                </p>
              </div>

              <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity">
                <Link to={`/read/${id}/1`} className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Start Reading
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-6">Chapters</h2>
          <div className="space-y-3">
            {displaySeries.chapters?.map((chapter: any) => (
              <Card key={chapter.number} className="hover:shadow-glow transition-all duration-300 bg-gradient-card border-border/50">
                <CardContent className="p-4">
                  <Link
                    to={`/read/${id}/${chapter.number}`}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        Chapter {chapter.number}: {chapter.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(chapter.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
