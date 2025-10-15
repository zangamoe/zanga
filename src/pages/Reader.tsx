import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Home, List } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
          {pages.map((page) => (
            <div
              key={page.id}
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
