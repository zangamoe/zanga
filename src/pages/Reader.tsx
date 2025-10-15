import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Home, List } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface ChapterPage {
  id: string;
  page_number: number;
  image_url: string;
}

const Reader = () => {
  const { seriesId, chapterNumber } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [chapterTitle, setChapterTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"scroll" | "page">("scroll");
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  
  const chapterNum = parseInt(chapterNumber || "1");

  useEffect(() => {
    if (seriesId && chapterNumber) {
      fetchChapterPages();
    }
  }, [seriesId, chapterNumber]);

  const fetchChapterPages = async () => {
    // First get the chapter ID
    const { data: chapterData } = await supabase
      .from("chapters")
      .select("id, title")
      .eq("series_id", seriesId)
      .eq("chapter_number", chapterNum)
      .single();

    if (chapterData) {
      setChapterTitle(chapterData.title);
      
      // Then get the pages for this chapter
      const { data: pagesData } = await supabase
        .from("chapter_pages")
        .select("*")
        .eq("chapter_id", chapterData.id)
        .order("page_number", { ascending: true });

      if (pagesData) {
        setPages(pagesData);
      }
    }
    setLoading(false);
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= pages.length) {
      setCurrentPage(pageNum);
      if (viewMode === "page") {
        pageRefs.current[pageNum]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < pages.length) {
      goToPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };
  
  const goToPrevChapter = () => {
    if (chapterNum > 1) {
      window.location.href = `/read/${seriesId}/${chapterNum - 1}`;
    }
  };

  const goToNextChapter = () => {
    window.location.href = `/read/${seriesId}/${chapterNum + 1}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading chapter...</p>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <Button asChild variant="ghost" size="sm">
              <Link to={`/series/${seriesId}`} className="flex items-center gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Series
              </Link>
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Chapter Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This chapter hasn't been uploaded yet or doesn't exist.
          </p>
          <Button asChild>
            <Link to={`/series/${seriesId}`}>
              Back to Series
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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
              <p className="font-semibold">Chapter {chapterNumber}{chapterTitle && `: ${chapterTitle}`}</p>
              <p className="text-sm text-muted-foreground">Page {currentPage} of {pages.length}</p>
              <div className="flex gap-2 justify-center mt-1">
                <Badge 
                  variant={viewMode === "scroll" ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setViewMode("scroll")}
                >
                  Scroll
                </Badge>
                <Badge 
                  variant={viewMode === "page" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setViewMode("page")}
                >
                  Page-by-Page
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {viewMode === "page" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev Page
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === pages.length}
                  >
                    Next Page
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
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

      {/* Reader Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {viewMode === "scroll" ? (
          <div className="space-y-2">
            {pages.map((page) => (
              <div
                key={page.id}
                ref={(el) => (pageRefs.current[page.page_number] = el)}
                className="rounded-lg overflow-hidden shadow-card"
                onMouseEnter={() => setCurrentPage(page.page_number)}
              >
                <img
                  src={page.image_url}
                  alt={`Page ${page.page_number}`}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {pages.filter(p => p.page_number === currentPage).map((page) => (
              <div
                key={page.id}
                ref={(el) => (pageRefs.current[page.page_number] = el)}
                className="rounded-lg overflow-hidden shadow-card max-w-full"
              >
                <img
                  src={page.image_url}
                  alt={`Page ${page.page_number}`}
                  className="w-full h-auto"
                />
              </div>
            ))}
            <div className="flex items-center gap-4 mt-6">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Page
              </Button>
              <span className="text-muted-foreground">
                Page {currentPage} of {pages.length}
              </span>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === pages.length}
              >
                Next Page
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

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
