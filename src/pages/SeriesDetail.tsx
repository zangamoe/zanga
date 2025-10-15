import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink } from "lucide-react";
import mangaCover1 from "@/assets/manga-cover-1.jpg";
import mangaCover2 from "@/assets/manga-cover-2.jpg";
import mangaCover3 from "@/assets/manga-cover-3.jpg";

const SeriesDetail = () => {
  const { id } = useParams();

  // Mock data - in a real app, this would come from a database
  const seriesData: Record<string, any> = {
    "1": {
      title: "Chronicles of the Azure Sky",
      cover: mangaCover1,
      status: "ongoing",
      author: "Takeshi Yamamoto",
      synopsis: "In a world where the sky burns azure blue, young warrior Kaito embarks on a perilous journey to save his homeland from an ancient evil that threatens to consume everything. Armed with a legendary sword passed down through generations, he must unite scattered clans and face impossible odds. As dark forces gather, Kaito discovers that his destiny is intertwined with the very fate of the world itself.",
      genres: ["Action", "Adventure", "Fantasy"],
      chapters: [
        { number: 12, title: "The Azure Blade", date: "2025-10-10" },
        { number: 11, title: "Valley of Shadows", date: "2025-10-03" },
        { number: 10, title: "Ancient Prophecy", date: "2025-09-26" },
        { number: 9, title: "Gathering Storm", date: "2025-09-19" },
        { number: 8, title: "The Lost Shrine", date: "2025-09-12" },
      ],
    },
    "2": {
      title: "Moonlit Memories",
      cover: mangaCover2,
      status: "ongoing",
      author: "Yuki Tanaka",
      synopsis: "Under the gentle glow of the moon, two souls reunite after years apart. Hana, a talented violinist, returns to her hometown to find her childhood friend Sora has been waiting all along. As they rediscover their connection, buried memories surface, revealing a love that transcends time and circumstance. A heartwarming tale of second chances and the enduring power of the heart.",
      genres: ["Romance", "Drama", "Slice of Life"],
      chapters: [
        { number: 8, title: "Moonlight Serenade", date: "2025-10-12" },
        { number: 7, title: "Cherry Blossoms Fall", date: "2025-10-05" },
        { number: 6, title: "Forgotten Promise", date: "2025-09-28" },
        { number: 5, title: "The Music Box", date: "2025-09-21" },
        { number: 4, title: "Reunion", date: "2025-09-14" },
      ],
    },
    "3": {
      title: "Neon Requiem",
      cover: mangaCover3,
      status: "ongoing",
      author: "Akira Kobayashi",
      synopsis: "In the neon-lit megacity of Neo-Tokyo 2087, cyber-detective Rei investigates a series of mysterious digital murders that blur the line between virtual and reality. As corporate conspiracies unfold and AI entities gain consciousness, Rei must question everything she knows about humanity, technology, and the nature of existence itself. The future is here, and it's darker than anyone imagined.",
      genres: ["Sci-Fi", "Thriller", "Cyberpunk"],
      chapters: [
        { number: 15, title: "Digital Ghost", date: "2025-10-13" },
        { number: 14, title: "Neon Shadows", date: "2025-10-06" },
        { number: 13, title: "Corporate Secrets", date: "2025-09-29" },
        { number: 12, title: "AI Awakening", date: "2025-09-22" },
        { number: 11, title: "Virtual Murder", date: "2025-09-15" },
      ],
    },
  };

  const series = seriesData[id || "1"];

  if (!series) {
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
                src={series.cover}
                alt={series.title}
                className="w-full rounded-lg shadow-glow"
              />
            </div>
          </div>

          {/* Series Info */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {series.title}
                </h1>
                <Badge className={statusColors[series.status as keyof typeof statusColors]} variant="outline">
                  {series.status}
                </Badge>
              </div>
              
              <p className="text-muted-foreground mb-4">
                By <span className="text-foreground font-semibold">{series.author}</span>
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {series.genres.map((genre: string) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="bg-secondary/30 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {series.synopsis}
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
            {series.chapters.map((chapter: any) => (
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
