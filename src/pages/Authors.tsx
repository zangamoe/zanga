import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { FaTwitter, FaInstagram, FaGlobe } from "react-icons/fa";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useParams } from "react-router-dom";

const Authors = () => {
  const { id } = useParams();
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
  const [pageContent, setPageContent] = useState({
    title: "Our Authors",
    subtitle: "Meet the talented Japanese manga artists we're proud to work with. Each brings their unique vision and storytelling prowess to create unforgettable narratives.",
    singleSubtitle: "Explore this talented artist's works and connect with them.",
    loadingText: "Loading authors...",
    emptyText: "No authors available yet. Check back soon!",
    noBio: "No bio available.",
    worksLabel: "Works:",
  });

  useEffect(() => {
    fetchAuthors();
    fetchPageContent();
  }, [id]);

  const fetchPageContent = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["authors_page_title", "authors_page_subtitle", "authors_single_subtitle", "authors_loading_text", "authors_empty_text", "authors_no_bio", "authors_works_label"]);

    if (data) {
      const newContent = { ...pageContent };
      data.forEach((item) => {
        const value = String(item.value);
        if (item.key === "authors_page_title") newContent.title = value;
        if (item.key === "authors_page_subtitle") newContent.subtitle = value;
        if (item.key === "authors_single_subtitle") newContent.singleSubtitle = value;
        if (item.key === "authors_loading_text") newContent.loadingText = value;
        if (item.key === "authors_empty_text") newContent.emptyText = value;
        if (item.key === "authors_no_bio") newContent.noBio = value;
        if (item.key === "authors_works_label") newContent.worksLabel = value;
      });
      setPageContent(newContent);
    }
  };

  const fetchAuthors = async () => {
    let query = supabase
      .from("authors")
      .select(`
        *,
        series_authors(
          series(
            id,
            title
          )
        )
      `)
      .order("name");

    if (id) {
      query = query.eq("id", id);
    }

    const { data } = await query;

    if (data) {
      const formattedAuthors = data.map((author) => ({
        id: author.id,
        name: author.name,
        bio: author.bio || "",
        profile_picture_url: author.profile_picture_url,
        series: author.series_authors?.map((sa: any) => sa.series.title) || [],
        seriesData: author.series_authors?.map((sa: any) => sa.series) || [],
        social: {
          twitter: author.twitter_url,
          instagram: author.instagram_url,
          website: author.website_url,
        },
      }));
      
      setAuthors(formattedAuthors);
      if (id && formattedAuthors.length > 0) {
        setSelectedAuthor(formattedAuthors[0]);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">{pageContent.loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {selectedAuthor ? selectedAuthor.name : pageContent.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {selectedAuthor 
              ? pageContent.singleSubtitle
              : pageContent.subtitle}
          </p>
        </div>

        {authors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {pageContent.emptyText}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {authors.map((author) => (
              <Link key={author.id} to={`/authors/${author.id}`}>
                <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300 cursor-pointer h-full">
                  <CardContent className="p-6">
                    {author.profile_picture_url && (
                      <div className="mb-4 flex justify-center">
                        <img
                          src={author.profile_picture_url}
                          alt={author.name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                        />
                      </div>
                    )}
                    
                    <h2 className="text-2xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent text-center">
                      {author.name}
                    </h2>
                    
                    <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                      {author.bio ? (author.bio.length > 150 ? `${author.bio.substring(0, 150)}...` : author.bio) : pageContent.noBio}
                    </p>

                    {author.series.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold mb-2">{pageContent.worksLabel}</h3>
                        <div className="flex flex-wrap gap-2">
                          {author.seriesData.map((series: any) => (
                            <span 
                              key={series.id}
                              className="text-sm bg-primary/10 text-primary px-2 py-1 rounded"
                            >
                              {series.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {author.social.twitter && (
                        <Button asChild variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                          <a href={author.social.twitter} target="_blank" rel="noopener noreferrer">
                            <FaTwitter className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {author.social.instagram && (
                        <Button asChild variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                          <a href={author.social.instagram} target="_blank" rel="noopener noreferrer">
                            <FaInstagram className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {author.social.website && (
                        <Button asChild variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                          <a href={author.social.website} target="_blank" rel="noopener noreferrer">
                            <FaGlobe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Authors;
