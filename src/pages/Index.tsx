import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SeriesCard from "@/components/SeriesCard";
import Navigation from "@/components/Navigation";
import heroBanner from "@/assets/hero-banner.jpg";
import mangaCover1 from "@/assets/manga-cover-1.jpg";
import mangaCover2 from "@/assets/manga-cover-2.jpg";
import mangaCover3 from "@/assets/manga-cover-3.jpg";

const Index = () => {
  const latestReleases = [
    {
      id: "1",
      title: "Chronicles of the Azure Sky",
      cover: mangaCover1,
      status: "ongoing" as const,
      latestChapter: "Chapter 12",
      description: "An epic adventure following a young warrior's journey to save their world from an ancient evil.",
    },
    {
      id: "2",
      title: "Moonlit Memories",
      cover: mangaCover2,
      status: "ongoing" as const,
      latestChapter: "Chapter 8",
      description: "A heartwarming romance story about rediscovering love under the moonlight.",
    },
    {
      id: "3",
      title: "Neon Requiem",
      cover: mangaCover3,
      status: "ongoing" as const,
      latestChapter: "Chapter 15",
      description: "A cyberpunk thriller set in a dystopian future where technology and humanity collide.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBanner}
            alt="Hero Banner"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container relative mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-primary font-semibold">Discover Amazing Stories</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Where Japanese Manga Meets English Readers
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Experience professionally localized manga from talented aspiring Japanese authors. New chapters released regularly.
            </p>
            <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
              <Link to="/series" className="flex items-center gap-2">
                Browse Series
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Releases */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Latest Releases</h2>
          <Button asChild variant="ghost">
            <Link to="/series" className="flex items-center gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestReleases.map((series) => (
            <div key={series.id} className="animate-fade-in">
              <SeriesCard {...series} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Supporting Aspiring Artists</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're dedicated to bringing exceptional manga from talented Japanese artists to English-speaking audiences. Every read helps support these creators in their journey.
            </p>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link to="/about">Learn Our Story</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
