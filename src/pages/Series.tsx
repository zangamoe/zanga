import Navigation from "@/components/Navigation";
import SeriesCard from "@/components/SeriesCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import mangaCover1 from "@/assets/manga-cover-1.jpg";
import mangaCover2 from "@/assets/manga-cover-2.jpg";
import mangaCover3 from "@/assets/manga-cover-3.jpg";

const Series = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const allSeries = [
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

  const filteredSeries = allSeries.filter((series) =>
    series.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            All Series
          </h1>
          <p className="text-muted-foreground mb-6">
            Explore our growing collection of localized manga from talented Japanese artists.
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSeries.map((series) => (
            <div key={series.id} className="animate-fade-in">
              <SeriesCard {...series} />
            </div>
          ))}
        </div>

        {filteredSeries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No series found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Series;
