import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SeriesRating from "@/components/SeriesRating";
import UserSeriesRating from "@/components/reader/SeriesRating";

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

  const totalChapters = displaySeries.chapters?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - MayoTune Style */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-6 md:p-12 border border-border/50 shadow-glow mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8 items-center">
            {/* Left: Series Info */}
            <div>
              {/* Genre Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {displaySeries.genres?.map((genre: string) => (
                  <Badge key={genre} variant="secondary" className="text-xs uppercase">
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold mb-2">
                {displaySeries.title.split(' ').slice(0, -1).join(' ') && (
                  <span className="text-foreground">{displaySeries.title.split(' ').slice(0, -1).join(' ')}</span>
                )}
                {displaySeries.title.split(' ').length > 1 && ' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {displaySeries.title.split(' ').slice(-1)[0]}
                </span>
              </h1>

              {/* Synopsis */}
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-2xl">
                {displaySeries.synopsis}
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">{totalChapters}</div>
                  <div className="text-xs text-muted-foreground">Chapters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">∞</div>
                  <div className="text-xs text-muted-foreground">Reads</div>
                </div>
                <div className="text-center">
                  <SeriesRating seriesId={displaySeries.id} ratingsEnabled={displaySeries.ratings_enabled} showCount={false} />
                  <div className="text-xs text-muted-foreground mt-1">Rating</div>
                </div>
                <div className="text-center">
                  <Badge className={`${statusColors[displaySeries.status as keyof typeof statusColors]} text-lg px-3 py-1`} variant="outline">
                    {displaySeries.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">Status</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  <Link to={`/read/${id}/1`} className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Start Reading
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#chapters" className="flex items-center gap-2">
                    All Chapters
                  </a>
                </Button>
              </div>
            </div>

            {/* Right: Cover Image */}
            <div className="flex justify-center lg:justify-end">
              <img
                src={displaySeries.cover_image_url || displaySeries.cover}
                alt={displaySeries.title}
                className="w-full max-w-[300px] lg:max-w-none lg:w-auto lg:h-[400px] object-cover rounded-lg shadow-glow"
              />
            </div>
          </div>
        </div>

        {/* Latest Chapters Section */}
        <div id="chapters" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Latest Chapters</h2>
              <p className="text-sm text-muted-foreground">Stay up to date with the newest releases</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySeries.chapters?.slice(0, 6).map((chapter: any, index: number) => (
              <Card key={chapter.id} className="hover:shadow-glow transition-all duration-300 bg-card/50 border-border/50 group relative overflow-hidden">
                {index === 0 && (
                  <Badge className="absolute top-3 right-3 bg-gradient-primary z-10">NEW</Badge>
                )}
                <CardContent className="p-6">
                  <Link to={`/read/${id}/${chapter.chapter_number}`}>
                    <div className="mb-2">
                      <div className="text-4xl font-bold text-muted-foreground/30 mb-2">{chapter.chapter_number}</div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {chapter.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      {new Date(chapter.published_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-card/30 rounded-2xl p-6 md:p-12 border border-border/50">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            About {displaySeries.title}
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-muted-foreground leading-relaxed text-center mb-6">
              {displaySeries.synopsis}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Author{displaySeries.authors?.length > 1 ? 's' : ''}</h3>
                <div className="text-muted-foreground">
                  {displaySeries.authors?.length > 0 ? (
                    displaySeries.authors.map((author: any, index: number) => (
                      <span key={author.id}>
                        <Link to={`/authors/${author.id}`} className="text-primary hover:underline">
                          {author.name}
                        </Link>
                        {index < displaySeries.authors.length - 1 && ", "}
                      </span>
                    ))
                  ) : (
                    <span>{displaySeries.author}</span>
                  )}
                </div>
              </div>
              
              {displaySeries.ratings_enabled && (
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Your Rating</h3>
                  <UserSeriesRating seriesId={displaySeries.id} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Chapters List */}
        {displaySeries.chapters?.length > 6 && (
          <div className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">All Chapters</h2>
            <div className="space-y-2">
              {displaySeries.chapters?.slice(6).map((chapter: any) => (
                <Card key={chapter.id} className="hover:shadow-glow transition-all duration-300 bg-card/30 border-border/30">
                  <CardContent className="p-4">
                    <Link
                      to={`/read/${id}/${chapter.chapter_number}`}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold text-muted-foreground/30 w-12">{chapter.chapter_number}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                            {chapter.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(chapter.published_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesDetail;
