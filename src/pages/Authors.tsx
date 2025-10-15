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

  useEffect(() => {
    fetchAuthors();
  }, [id]);

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
          <p className="text-muted-foreground">Loading authors...</p>
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
            {selectedAuthor ? selectedAuthor.name : "Our Authors"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {selectedAuthor 
              ? "Explore this talented artist's works and connect with them."
              : "Meet the talented Japanese manga artists we're proud to work with. Each brings their unique vision and storytelling prowess to create unforgettable narratives."}
          </p>
        </div>

        {authors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No authors available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {authors.map((author) => (
              <Card key={author.id} className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
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
                  
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {author.bio || "No bio available."}
                  </p>

                  {author.series.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Works:</h3>
                      <ul className="space-y-1">
                        {author.seriesData.map((series: any) => (
                          <li key={series.id}>
                            <Link 
                              to={`/series/${series.id}`}
                              className="text-primary hover:underline"
                            >
                              {series.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {author.social.twitter && (
                      <Button asChild variant="outline" size="sm">
                        <a href={author.social.twitter} target="_blank" rel="noopener noreferrer">
                          <FaTwitter className="h-4 w-4 mr-2" />
                          Twitter
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </a>
                      </Button>
                    )}
                    {author.social.instagram && (
                      <Button asChild variant="outline" size="sm">
                        <a href={author.social.instagram} target="_blank" rel="noopener noreferrer">
                          <FaInstagram className="h-4 w-4 mr-2" />
                          Instagram
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </a>
                      </Button>
                    )}
                    {author.social.website && (
                      <Button asChild variant="outline" size="sm">
                        <a href={author.social.website} target="_blank" rel="noopener noreferrer">
                          <FaGlobe className="h-4 w-4 mr-2" />
                          Website
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Authors;
