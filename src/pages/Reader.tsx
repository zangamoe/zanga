import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Home, List } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import ChapterComments from "@/components/reader/ChapterComments";
import ChapterRating from "@/components/reader/ChapterRating";

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
  const [chapterId, setChapterId] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"scroll" | "page">("page");
  const [readingDirection, setReadingDirection] = useState<"ltr" | "rtl">("rtl");
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
      .select("id, title, reading_direction")
      .eq("series_id", seriesId)
      .eq("chapter_number", chapterNum)
      .single();

    if (chapterData) {
      setChapterTitle(chapterData.title);
      setChapterId(chapterData.id);
      setReadingDirection((chapterData.reading_direction as "ltr" | "rtl") || "rtl");
      
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

  // Keyboard navigation - disabled in scroll mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (viewMode !== "page") return;
      
      if (readingDirection === "rtl") {
        if (e.key === "ArrowLeft") {
          if (currentPage === pages.length) {
            goToNextChapter();
          } else {
            handleNextPage();
          }
        }
        if (e.key === "ArrowRight") handlePrevPage();
      } else {
        if (e.key === "ArrowLeft") handlePrevPage();
        if (e.key === "ArrowRight") {
          if (currentPage === pages.length) {
            goToNextChapter();
          } else {
            handleNextPage();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, pages.length, viewMode, readingDirection]);

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= pages.length) {
      setCurrentPage(pageNum);
      if (viewMode === "page") {
        pageRefs.current[pageNum]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleNextPage = () => {
    if (readingDirection === "rtl") {
      if (currentPage < pages.length) {
        goToPage(currentPage + 1);
      }
    } else {
      if (currentPage < pages.length) {
        goToPage(currentPage + 1);
      }
    }
  };

  const handlePrevPage = () => {
    if (readingDirection === "rtl") {
      if (currentPage > 1) {
        goToPage(currentPage - 1);
      }
    } else {
      if (currentPage > 1) {
        goToPage(currentPage - 1);
      }
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
                {viewMode === "page" && (
                  <>
                    <Badge 
                      variant={readingDirection === "rtl" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setReadingDirection("rtl")}
                    >
                      RTL ←
                    </Badge>
                    <Badge 
                      variant={readingDirection === "ltr" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setReadingDirection("ltr")}
                    >
                      LTR →
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {viewMode === "page" && (
                <>
                  {readingDirection === "rtl" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === pages.length}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        Prev
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === pages.length}
                      >
                        Next
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reader Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {viewMode === "scroll" ? (
          <>
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
            {/* Scroll Mode Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8 py-6 border-t border-border">
              <Button
                variant="outline"
                onClick={goToPrevChapter}
                disabled={chapterNum <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Chapter
              </Button>
              <Button asChild variant="outline">
                <Link to={`/series/${seriesId}`}>
                  All Chapters
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
          </>
        ) : (
          <div className="flex flex-col items-center">
            {pages.filter(p => p.page_number === currentPage).map((page) => (
              <div
                key={page.id}
                ref={(el) => (pageRefs.current[page.page_number] = el)}
                className="rounded-lg overflow-hidden shadow-card max-w-full relative cursor-pointer"
                onClick={(e) => {
                  // Mobile tap navigation zones
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const zoneWidth = rect.width / 3;
                  
                  if (clickX < zoneWidth) {
                    // Left zone - Previous (or Next in RTL)
                    readingDirection === "rtl" ? handleNextPage() : handlePrevPage();
                  } else if (clickX > zoneWidth * 2) {
                    // Right zone - Next (or Previous in RTL)
                    readingDirection === "rtl" ? handlePrevPage() : handleNextPage();
                  }
                  // Center zone - do nothing (can be used for controls toggle later)
                }}
              >
                <img
                  src={page.image_url}
                  alt={`Page ${page.page_number}`}
                  className="w-full h-auto"
                />
                {/* Visual tap zone hints for mobile */}
                <div className="absolute inset-0 pointer-events-none md:hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1/3 opacity-0 hover:opacity-10 bg-gradient-to-r from-white to-transparent transition-opacity" />
                  <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-0 hover:opacity-10 bg-gradient-to-l from-white to-transparent transition-opacity" />
                </div>
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

        {/* Comments and Ratings Section */}
        {chapterId && (
          <div className="mt-12 space-y-8">
            <ChapterRating chapterId={chapterId} seriesId={seriesId!} />
            <ChapterComments chapterId={chapterId} />
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
