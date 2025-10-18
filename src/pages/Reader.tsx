import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Home, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  const [showSettings, setShowSettings] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [seriesTitle, setSeriesTitle] = useState("");
  const [allChapters, setAllChapters] = useState<any[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  
  const chapterNum = parseInt(chapterNumber || "1");
  const minSwipeDistance = 50;

  useEffect(() => {
    if (seriesId && chapterNumber) {
      fetchChapterPages();
    }
  }, [seriesId, chapterNumber]);

  const fetchChapterPages = async () => {
    // First get the chapter ID and series info
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

    // Fetch series title
    const { data: seriesData } = await supabase
      .from("series")
      .select("title")
      .eq("id", seriesId)
      .single();
    
    if (seriesData) {
      setSeriesTitle(seriesData.title);
    }

    // Fetch all chapters for selector
    const { data: chaptersData } = await supabase
      .from("chapters")
      .select("*")
      .eq("series_id", seriesId)
      .order("chapter_number", { ascending: false });
    
    if (chaptersData) {
      setAllChapters(chaptersData);
    }

    setLoading(false);
  };

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (viewMode === "page") {
      if (readingDirection === "rtl") {
        if (isLeftSwipe) handleNextPage();
        if (isRightSwipe) handlePrevPage();
      } else {
        if (isLeftSwipe) handlePrevPage();
        if (isRightSwipe) handleNextPage();
      }
    }
  };

  // Keyboard navigation
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
    }
  };

  const getProgress = () => {
    if (viewMode === "scroll") {
      return scrollProgress;
    }
    if (readingDirection === "rtl") {
      return ((pages.length - currentPage + 1) / pages.length) * 100;
    }
    return (currentPage / pages.length) * 100;
  };

  // Handle scroll progress for vertical scroll mode
  useEffect(() => {
    if (viewMode !== "scroll" || !containerRef.current) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [viewMode]);

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
      {/* Compact Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 border-b border-border transition-all duration-300 ${
        viewMode === "scroll" ? "bg-background" : "bg-background/98 backdrop-blur-md"
      }`}>
        <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="h-8">
              <Link to="/">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-8 px-3">
              <Link to={`/series/${seriesId}`} className="flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                <span className="text-xs">Back to {seriesTitle || "Series"}</span>
              </Link>
            </Button>
          </div>

          {/* Center: Chapter Selector */}
          <div className="flex-1 flex items-center justify-center gap-2 px-4">
            <select
              value={chapterNum}
              onChange={(e) => {
                window.location.href = `/read/${seriesId}/${e.target.value}`;
              }}
              className="bg-secondary text-foreground text-sm font-semibold px-3 py-1 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {allChapters.map((chapter) => (
                <option key={chapter.id} value={chapter.chapter_number}>
                  Ch. {chapter.chapter_number}: {chapter.title}
                </option>
              ))}
            </select>
            {viewMode === "page" && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {currentPage} / {pages.length}
              </span>
            )}
          </div>

          {/* Right: Settings */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-border bg-background/95 backdrop-blur-md p-4">
            <div className="max-w-7xl mx-auto space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">View:</span>
                <Badge 
                  variant={viewMode === "page" ? "default" : "outline"} 
                  className="cursor-pointer transition-all"
                  onClick={() => setViewMode("page")}
                >
                  Single Page
                </Badge>
                <Badge 
                  variant={viewMode === "scroll" ? "default" : "outline"}
                  className="cursor-pointer transition-all"
                  onClick={() => setViewMode("scroll")}
                >
                  Vertical Scroll
                </Badge>
              </div>

              {viewMode === "page" && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Direction:</span>
                  <Badge 
                    variant={readingDirection === "rtl" ? "default" : "outline"}
                    className="cursor-pointer transition-all"
                    onClick={() => setReadingDirection("rtl")}
                  >
                    Right to Left ←
                  </Badge>
                  <Badge 
                    variant={readingDirection === "ltr" ? "default" : "outline"}
                    className="cursor-pointer transition-all"
                    onClick={() => setReadingDirection("ltr")}
                  >
                    Left to Right →
                  </Badge>
                </div>
              )}

              {viewMode === "page" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === pages.length}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border mx-2" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevChapter}
                    disabled={chapterNum <= 1}
                  >
                    Prev Chapter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextChapter}
                  >
                    Next Chapter
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <Progress 
          value={getProgress()} 
          className="h-1 rounded-none"
        />
      </div>

      {/* Reader Content */}
      <div 
        ref={containerRef}
        className="pt-16 pb-4"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {viewMode === "scroll" ? (
          <div className="max-w-full mx-auto px-0 space-y-0">
            {pages.map((page) => (
              <div
                key={page.id}
                ref={(el) => (pageRefs.current[page.page_number] = el)}
                className="relative w-full flex items-center justify-center bg-background"
                style={{ minHeight: "100vh" }}
              >
                <img
                  src={page.image_url}
                  alt={`Page ${page.page_number}`}
                  className="w-full h-auto max-h-screen object-contain"
                  loading="lazy"
                  onLoad={() => {
                    const rect = pageRefs.current[page.page_number]?.getBoundingClientRect();
                    if (rect && rect.top >= 0 && rect.top < window.innerHeight / 2) {
                      setCurrentPage(page.page_number);
                    }
                  }}
                />
              </div>
            ))}
            
            {/* Chapter End - Comments and Ratings */}
            {chapterId && (
              <div className="mt-12 space-y-8 px-4">
                <div className="text-center py-8 border-t border-border">
                  <h2 className="text-2xl font-bold mb-4">End of Chapter {chapterNumber}</h2>
                </div>
                <ChapterRating chapterId={chapterId} seriesId={seriesId!} />
                <ChapterComments chapterId={chapterId} />
              </div>
            )}

            {/* Scroll Mode Navigation */}
            <div className="flex items-center justify-center gap-4 py-8 border-t border-border">
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
                onClick={goToNextChapter}
                className="bg-gradient-primary hover:opacity-90"
              >
                Next Chapter
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex flex-col items-center justify-center px-0 bg-background">
            {pages.filter(p => p.page_number === currentPage).map((page) => (
              <div
                key={page.id}
                className="relative w-full h-screen flex items-center justify-center animate-fade-in"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const zoneWidth = rect.width / 3;
                  
                  if (clickX < zoneWidth) {
                    readingDirection === "rtl" ? handleNextPage() : handlePrevPage();
                  } else if (clickX > zoneWidth * 2) {
                    readingDirection === "rtl" ? handlePrevPage() : handleNextPage();
                  } else {
                    setShowSettings(!showSettings);
                  }
                }}
              >
                <img
                  src={page.image_url}
                  alt={`Page ${page.page_number}`}
                  className="max-w-full max-h-screen w-auto h-auto object-contain cursor-pointer select-none"
                  draggable={false}
                />
              </div>
            ))}

            {/* Show comments at last page */}
            {currentPage === pages.length && chapterId && (
              <div className="mt-12 space-y-8 w-full max-w-4xl px-4">
                <div className="text-center py-8 border-t border-border">
                  <h2 className="text-2xl font-bold mb-4">End of Chapter {chapterNumber}</h2>
                </div>
                <ChapterRating chapterId={chapterId} seriesId={seriesId!} />
                <ChapterComments chapterId={chapterId} />
                
                {/* Navigation Footer */}
                <div className="flex items-center justify-center gap-4 py-8 border-t border-border">
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
                      Back to Series
                    </Link>
                  </Button>
                  <Button
                    onClick={goToNextChapter}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Next Chapter
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reader;
