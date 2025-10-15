import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { FaTwitter, FaInstagram, FaGlobe } from "react-icons/fa";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useParams, useNavigate } from "react-router-dom";

const AuthorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthor();
  }, [id]);

  const fetchAuthor = async () => {
    const { data } = await supabase
      .from("authors")
      .select(`
        *,
        series_authors(
          series(
            id,
            title,
            cover_image_url,
            synopsis,
            status
          )
        )
      `)
      .eq("id", id)
      .single();

    if (data) {
      setAuthor({
        id: data.id,
        name: data.name,
        bio: data.bio || "",
        profile_picture_url: data.profile_picture_url,
        seriesData: data.series_authors?.map((sa: any) => sa.series) || [],
        social: {
          twitter: data.twitter_url,
          instagram: data.instagram_url,
          website: data.website_url,
        },
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

  if (!author) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Author not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <Button 
          variant="outline" 
          onClick={() => navigate("/authors")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Authors
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Author Info Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6">
                {author.profile_picture_url && (
                  <div className="mb-6 flex justify-center">
                    <img
                      src={author.profile_picture_url}
                      alt={author.name}
                      className="w-48 h-48 rounded-full object-cover border-4 border-primary/20"
                    />
                  </div>
                )}
                
                <h1 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent text-center">
                  {author.name}
                </h1>
                
                <div className="flex flex-wrap justify-center gap-2 mb-6">
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

                <div>
                  <h2 className="text-xl font-semibold mb-3">Biography</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {author.bio || "No biography available."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Works */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Works</h2>
            
            {author.seriesData.length === 0 ? (
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No series available yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {author.seriesData.map((series: any) => (
                  <Link key={series.id} to={`/series/${series.id}`}>
                    <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300 cursor-pointer h-full">
                      <CardContent className="p-0">
                        {series.cover_image_url && (
                          <img
                            src={series.cover_image_url}
                            alt={series.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="text-xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                            {series.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-3">
                            {series.synopsis}
                          </p>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {series.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorDetail;
