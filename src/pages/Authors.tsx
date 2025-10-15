import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { FaTwitter, FaInstagram, FaGlobe } from "react-icons/fa";

const Authors = () => {
  const authors = [
    {
      name: "Takeshi Yamamoto",
      bio: "A rising star in the manga industry, Takeshi specializes in epic action-adventure stories. With a background in traditional Japanese art, his work combines classical aesthetics with modern storytelling.",
      series: ["Chronicles of the Azure Sky"],
      social: {
        twitter: "https://twitter.com",
        instagram: "https://instagram.com",
        website: "https://example.com",
      },
    },
    {
      name: "Yuki Tanaka",
      bio: "Known for her emotionally resonant romance stories, Yuki brings depth and authenticity to every character she creates. Her work explores the complexities of human relationships with grace and sensitivity.",
      series: ["Moonlit Memories"],
      social: {
        twitter: "https://twitter.com",
        instagram: "https://instagram.com",
      },
    },
    {
      name: "Akira Kobayashi",
      bio: "A visionary in the cyberpunk genre, Akira creates dystopian worlds that challenge our perception of technology and humanity. His intricate plots and stunning visuals have garnered international attention.",
      series: ["Neon Requiem"],
      social: {
        twitter: "https://twitter.com",
        website: "https://example.com",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Our Authors
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Meet the talented Japanese manga artists we're proud to work with. Each brings their unique vision and storytelling prowess to create unforgettable narratives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {authors.map((author) => (
            <Card key={author.name} className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
                  {author.name}
                </h2>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {author.bio}
                </p>

                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Works:</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {author.series.map((series) => (
                      <li key={series}>{series}</li>
                    ))}
                  </ul>
                </div>

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
      </div>
    </div>
  );
};

export default Authors;
