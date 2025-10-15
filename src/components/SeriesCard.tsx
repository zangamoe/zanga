import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SeriesCardProps {
  id: string;
  title: string;
  cover: string;
  status: "ongoing" | "completed" | "hiatus";
  latestChapter?: string;
  description: string;
}

const SeriesCard = ({ id, title, cover, status, latestChapter, description }: SeriesCardProps) => {
  const statusColors = {
    ongoing: "bg-green-500/20 text-green-400 border-green-500/50",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    hiatus: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  };

  return (
    <Link to={`/series/${id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-glow hover:scale-[1.02] bg-gradient-card border-border/50">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1">{title}</h3>
            <Badge className={statusColors[status]} variant="outline">
              {status}
            </Badge>
          </div>
          {latestChapter && (
            <p className="text-sm text-muted-foreground mb-2">Latest: {latestChapter}</p>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SeriesCard;
