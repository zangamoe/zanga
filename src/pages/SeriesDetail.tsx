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
      
      {/* Hero Section - Redesigned */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="bg-gradient-to-br from-card/80 to-card/40 rounded-2xl p-6 md:p-12 border border-border/50 shadow-glow mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-8">
            {/* Left: Cover Image */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <img
                  src={displaySeries.cover_image_url || displaySeries.cover}
                  alt={displaySeries.title}
                  className="w-full max-w-[280px] lg:w-[280px] h-[420px] object-cover rounded-lg shadow-glow"
                />
                {displaySeries.is_new && (
                  <Badge className="absolute -top-2 -right-2 bg-gradient-primary text-white font-bold px-4 py-2 shadow-glow animate-pulse text-sm">
                    NEW
                  </Badge>
                )}
              </div>
            </div>

            {/* Right: Series Info */}
            <div className="space-y-6">
              {/* Title & Status/Genres */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={`${statusColors[displaySeries.status as keyof typeof statusColors]} text-xs uppercase font-semibold px-3 py-1`} variant="outline">
                    {displaySeries.status}
                  </Badge>
                  {displaySeries.genres?.map((genre: string) => (
                    <Badge key={genre} variant="secondary" className="text-xs uppercase font-semibold px-3 py-1">
                      {genre}
                    </Badge>
                  ))}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                  {displaySeries.title.split(' ').slice(0, -1).join(' ') && (
                    <span className="text-foreground">{displaySeries.title.split(' ').slice(0, -1).join(' ')}</span>
                  )}
                  {displaySeries.title.split(' ').length > 1 && ' '}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    {displaySeries.title.split(' ').slice(-1)[0]}
                  </span>
                </h1>

                {/* Author Info - More Prominent */}
                <div className="flex items-center gap-2 text-lg text-muted-foreground mt-2">
                  <span>by</span>
                  {displaySeries.authors?.length > 0 ? (
                    displaySeries.authors.map((author: any, index: number) => (
                      <span key={author.id}>
                        <Link to={`/authors/${author.id}`} className="text-primary hover:underline font-semibold">
                          {author.name}
                        </Link>
                        {index < displaySeries.authors.length - 1 && ", "}
                      </span>
                    ))
                  ) : (
                    <span className="font-semibold">{displaySeries.author}</span>
                  )}
                </div>
              </div>

              {/* Synopsis */}
              <p className="text-muted-foreground leading-relaxed text-base">
                {displaySeries.synopsis}
              </p>

              {/* Stats Grid - Larger & Better Spaced */}
              <div className="grid grid-cols-2 gap-6 bg-card/50 rounded-lg p-6 border border-border/30">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{totalChapters}</div>
                  <div className="text-sm text-muted-foreground mt-1">Chapters</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">
                    {displaySeries.next_chapter_release 
                      ? new Date(displaySeries.next_chapter_release).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Undetermined"
                    }
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Next Release</div>
                </div>
              </div>

              {/* Rating Section - User Rating Next to Overall */}
              {displaySeries.ratings_enabled && (
                <div className="bg-card/50 rounded-lg p-6 border border-border/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Series Rating</h3>
                      <div className="scale-125 origin-left">
                        <SeriesRating seriesId={displaySeries.id} ratingsEnabled={displaySeries.ratings_enabled} showCount={true} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Your Rating</h3>
                      <UserSeriesRating seriesId={displaySeries.id} />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-6">
                  <Link to={`/read/${id}/1`} className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6" />
                    Start Reading
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg py-6">
                  <a href="#chapters" className="flex items-center gap-2">
                    All Chapters
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* About this Series */}
        {displaySeries.detailed_synopsis && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">About {displaySeries.title}</h2>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-8">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap mb-6">
                  {displaySeries.detailed_synopsis}
                </p>
                {displaySeries.authors?.length > 0 && (
                  <Link 
                    to={`/authors/${displaySeries.authors[0].id}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
                  >
                    Check out the author
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Latest Chapters Section */}
        <div id="chapters" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Latest Chapters</h2>
              <p className="text-sm text-muted-foreground">Stay up to date with the newest releases</p>
            </div>
            {displaySeries.chapters?.length > 3 && (
              <Link 
                to={`/series/${id}/chapters`}
                className="text-primary hover:underline flex items-center gap-2 font-semibold"
              >
                View All
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySeries.chapters?.slice(0, 3).map((chapter: any, index: number) => (
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


      </div>
    </div>
  );
};

export default SeriesDetail;
