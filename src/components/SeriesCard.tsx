import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SeriesRating from "./SeriesRating";

interface SeriesCardProps {
  id: string;
  title: string;
  cover: string;
  status: "ongoing" | "completed" | "hiatus";
  latestChapter?: string;
  description: string;
  ratingsEnabled?: boolean;
  isNew?: boolean;
}

const SeriesCard = ({ id, title, cover, status, latestChapter, description, ratingsEnabled = true, isNew = false }: SeriesCardProps) => {
  const statusColors = {
    ongoing: "bg-green-500/20 text-green-400 border-green-500/50",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    hiatus: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  };

  return (
    <Link to={`/series/${id}`} className="h-full">
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-glow hover:scale-[1.02] bg-gradient-card border-border/50 h-full flex flex-col relative">
        {isNew && (
          <Badge className="absolute top-3 left-3 z-10 bg-gradient-primary text-white font-bold px-3 py-1 shadow-glow animate-pulse">
            NEW
          </Badge>
        )}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <Badge className={`${statusColors[status]} absolute top-3 right-3`} variant="outline">
            {status}
          </Badge>
        </div>
        <CardContent className="p-3 md:p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-2">{title}</h3>
          <div className="mt-auto">
            {ratingsEnabled && (
              <div className="mb-2">
                <SeriesRating seriesId={id} ratingsEnabled={ratingsEnabled} showCount={false} />
              </div>
            )}
            {latestChapter && (
              <p className="text-xs text-muted-foreground">{latestChapter}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SeriesCard;
