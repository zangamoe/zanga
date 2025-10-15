import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Home, List } from "lucide-react";
import { useState } from "react";

const Reader = () => {
  const { seriesId, chapterNumber } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock data - in a real app, this would come from a database
  const totalPages = 24;
  const chapterNum = parseInt(chapterNumber || "1");
  
  const goToPrevChapter = () => {
    if (chapterNum > 1) {
      window.location.href = `/read/${seriesId}/${chapterNum - 1}`;
    }
  };

  const goToNextChapter = () => {
    window.location.href = `/read/${seriesId}/${chapterNum + 1}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Reader Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/series/${seriesId}`} className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Chapters
                </Link>
              </Button>
            </div>
            
            <div className="text-center">
              <p className="font-semibold">Chapter {chapterNumber}</p>
              <p className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevChapter}
                disabled={chapterNum <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev Chapter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextChapter}
              >
                Next Chapter
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reader Content - Scroll-based */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <div
              key={page}
              className="bg-secondary/20 rounded-lg overflow-hidden shadow-card"
              onMouseEnter={() => setCurrentPage(page)}
            >
              <div className="aspect-[2/3] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-6xl font-bold mb-2">{page}</p>
                  <p className="text-sm">Manga Page {page}</p>
                  <p className="text-xs mt-4 max-w-md px-4">
                    In a real implementation, this would display the actual manga page image.
                    Pages would be uploaded through an admin panel.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between mt-8 py-6 border-t border-border">
          <Button
            variant="default"
            onClick={goToPrevChapter}
            disabled={chapterNum <= 1}
            className="bg-gradient-primary hover:opacity-90"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous Chapter
          </Button>
          <Button asChild variant="outline">
            <Link to={`/series/${seriesId}`}>
              Back to Series
            </Link>
          </Button>
          <Button
            variant="default"
            onClick={goToNextChapter}
            className="bg-gradient-primary hover:opacity-90"
          >
            Next Chapter
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Reader;
