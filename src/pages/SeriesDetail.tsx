import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import SeriesRating from "@/components/SeriesRating";
import UserSeriesRating from "@/components/reader/SeriesRating";

const SeriesDetail = () => {
  const { id } = useParams();
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pageContent, setPageContent] = useState({
    latestChaptersTitle: "Latest Chapters",
    latestChaptersSubtitle: "Stay up to date with the newest releases",
    viewAllText: "View All",
    aboutTagline: "Experience every emotion, every whispered confession, and every heartbeat in this beautifully crafted tale.",
    authorLinkText: "Check out the author",
    chaptersLabel: "Chapters",
    nextReleaseLabel: "Next Release",
    ratingTitle: "Rating",
    yourRatingTitle: "Your Rating",
  });

  useEffect(() => {
    if (id) {
      fetchSeries();
      fetchPageContent();
    }
  }, [id]);

  const fetchPageContent = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "series_detail_latest_chapters_title",
        "series_detail_latest_chapters_subtitle",
        "series_detail_view_all_text",
        "series_detail_about_tagline",
        "series_detail_author_link_text",
        "series_detail_stats_chapters_label",
        "series_detail_stats_next_release_label",
        "series_detail_rating_title",
        "series_detail_your_rating_title",
      ]);

    if (data) {
      const newContent = { ...pageContent };
      data.forEach((item) => {
        if (item.key === "series_detail_latest_chapters_title") newContent.latestChaptersTitle = String(item.value);
        if (item.key === "series_detail_latest_chapters_subtitle") newContent.latestChaptersSubtitle = String(item.value);
        if (item.key === "series_detail_view_all_text") newContent.viewAllText = String(item.value);
        if (item.key === "series_detail_about_tagline") newContent.aboutTagline = String(item.value);
        if (item.key === "series_detail_author_link_text") newContent.authorLinkText = String(item.value);
        if (item.key === "series_detail_stats_chapters_label") newContent.chaptersLabel = String(item.value);
        if (item.key === "series_detail_stats_next_release_label") newContent.nextReleaseLabel = String(item.value);
        if (item.key === "series_detail_rating_title") newContent.ratingTitle = String(item.value);
        if (item.key === "series_detail_your_rating_title") newContent.yourRatingTitle = String(item.value);
      });
      setPageContent(newContent);
    }
  };

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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 bg-card/50 rounded-lg p-6 border border-border/30">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{totalChapters}</div>
                  <div className="text-sm text-muted-foreground mt-1">{pageContent.chaptersLabel}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    {displaySeries.next_chapter_release 
                      ? new Date(displaySeries.next_chapter_release).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Undetermined"
                    }
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{pageContent.nextReleaseLabel}</div>
                </div>
              </div>

              {/* Rating Section */}
              {displaySeries.ratings_enabled && (
                <div className="bg-card/50 rounded-lg p-6 border border-border/30">
                  <h3 className="font-semibold text-lg mb-4">{pageContent.ratingTitle}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <SeriesRating seriesId={displaySeries.id} ratingsEnabled={displaySeries.ratings_enabled} showCount={true} />
                  </div>
                  <div className="border-t border-border/30 pt-4">
                    <h4 className="font-semibold mb-3">{pageContent.yourRatingTitle}</h4>
                    <UserSeriesRating seriesId={displaySeries.id} />
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

        {/* Latest Chapters Section */}
        <div id="chapters" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">{pageContent.latestChaptersTitle}</h2>
                <p className="text-sm text-muted-foreground">{pageContent.latestChaptersSubtitle}</p>
              </div>
            </div>
            {displaySeries.chapters?.length > 3 && (
              <Button asChild variant="outline" size="sm">
                <Link to={`/series/${id}/chapters`}>
                  {pageContent.viewAllText}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displaySeries.chapters?.slice(0, 3).map((chapter: any, index: number) => (
              <Link key={chapter.id} to={`/read/${id}/${chapter.chapter_number}`}>
                <Card className="hover:shadow-glow transition-all duration-300 bg-card/50 border-border/50 group relative overflow-hidden h-full">
                  {index === 0 && (
                    <Badge className="absolute top-3 right-3 bg-gradient-primary z-10 text-xs px-2 py-1">NEW</Badge>
                  )}
                  <CardContent className="p-6 relative">
                    <div className="absolute top-4 right-6 text-8xl font-bold text-muted-foreground/10 pointer-events-none">
                      {chapter.chapter_number}
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                        Chapter {chapter.chapter_number}
                      </h3>
                      <h4 className="text-base font-semibold text-muted-foreground mb-2 line-clamp-2">
                        {chapter.title}
                      </h4>
                      <p className="text-sm text-muted-foreground/70 mb-3">
                        20 pages
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(chapter.published_date).toLocaleDateString("en-US", {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* About this Series */}
        {displaySeries.detailed_synopsis && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">About {displaySeries.title}</h2>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap mb-6 max-w-4xl mx-auto">
                  {displaySeries.detailed_synopsis}
                </p>
                <p className="text-sm text-muted-foreground/70 italic mb-6">
                  {pageContent.aboutTagline}
                </p>
                {displaySeries.authors?.length > 0 && (
                  <Link 
                    to={`/authors/${displaySeries.authors[0].id}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
                  >
                    {pageContent.authorLinkText}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default SeriesDetail;
