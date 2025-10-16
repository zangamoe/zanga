import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SeriesRating from "./SeriesRating";

interface Author {
  id: string;
  name: string;
}

interface HomeSeriesCardProps {
  id: string;
  title: string;
  cover: string;
  status: "ongoing" | "completed" | "hiatus";
  authors?: Author[];
  genres?: string[];
  ratingsEnabled?: boolean;
  isNew?: boolean;
}

const HomeSeriesCard = ({ 
  id, 
  title, 
  cover, 
  status, 
  authors = [], 
  genres = [], 
  ratingsEnabled = true,
  isNew = false 
}: HomeSeriesCardProps) => {
  const statusColors = {
    ongoing: "bg-green-500/20 text-green-400 border-green-500/50",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    hiatus: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  };

  return (
    <Link to={`/series/${id}`} className="h-full group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-glow hover:scale-[1.02] bg-gradient-card border-border/50 h-full flex flex-col relative">
        {/* NEW Badge */}
        {isNew && (
          <Badge className="absolute top-3 left-3 z-10 bg-gradient-primary text-white font-bold px-3 py-1 shadow-glow animate-pulse">
            NEW
          </Badge>
        )}
        
        {/* Cover Image */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Content */}
        <CardContent className="p-4 flex-1 flex flex-col space-y-3">
          {/* Title */}
          <h3 className="font-bold text-base md:text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Author */}
          {authors.length > 0 && (
            <div className="text-xs text-muted-foreground">
              By {authors.map((author, idx) => (
                <span key={author.id} className="text-primary">
                  {author.name}
                  {idx < authors.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}

          {/* Status & Genres */}
          <div className="flex flex-wrap gap-1">
            <Badge className={`${statusColors[status]} text-xs px-2 py-0.5`} variant="outline">
              {status}
            </Badge>
            {genres.slice(0, 2).map((genre) => (
              <Badge 
                key={genre} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-secondary/50 hover:bg-secondary"
              >
                {genre}
              </Badge>
            ))}
            {genres.length > 2 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                +{genres.length - 2}
              </Badge>
            )}
          </div>

          {/* Rating */}
          {ratingsEnabled && (
            <div className="mt-auto pt-2 border-t border-border/50">
              <SeriesRating seriesId={id} ratingsEnabled={ratingsEnabled} showCount={false} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default HomeSeriesCard;
