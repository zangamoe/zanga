import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Trash2, Upload, GripVertical, Download, ChevronUp, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ChapterPage {
  id: string;
  chapter_id: string;
  page_number: number;
  image_url: string;
}

interface ChapterPageEditorProps {
  chapterId: string;
  onClose: () => void;
}

const ChapterPageEditor = ({ chapterId, onClose }: ChapterPageEditorProps) => {
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [draggedPage, setDraggedPage] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, [chapterId]);

  const fetchPages = async () => {
    const { data, error } = await supabase
      .from("chapter_pages")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("page_number");

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading pages",
        description: error.message,
      });
    } else {
      setPages(data || []);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newPageNumber = pages.length > 0 ? Math.max(...pages.map(p => p.page_number)) + 1 : 1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${chapterId}-page-${newPageNumber + i}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("manga-images")
        .upload(fileName, file);

      if (uploadError) {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: uploadError.message,
        });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("manga-images")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("chapter_pages")
        .insert({
          chapter_id: chapterId,
          page_number: newPageNumber + i,
          image_url: publicUrl,
        });

      if (insertError) {
        toast({
          variant: "destructive",
          title: "Error saving page",
          description: insertError.message,
        });
      }
    }

    toast({ title: `${files.length} page(s) uploaded successfully` });
    fetchPages();
    setUploading(false);
  };

  const handleDelete = async (page: ChapterPage) => {
    if (!confirm(`Delete page ${page.page_number}?`)) return;

    const { error } = await supabase
      .from("chapter_pages")
      .delete()
      .eq("id", page.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error deleting page",
        description: error.message,
      });
    } else {
      toast({ title: "Page deleted" });
      fetchPages();
    }
  };

  const handleReorder = async (pageId: string, newPageNumber: number) => {
    const { error } = await supabase
      .from("chapter_pages")
      .update({ page_number: newPageNumber })
      .eq("id", pageId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error reordering",
        description: error.message,
      });
    } else {
      fetchPages();
    }
  };

  const handleMoveUp = async (page: ChapterPage) => {
    const currentIndex = pages.findIndex(p => p.id === page.id);
    if (currentIndex <= 0) return;
    
    const previousPage = pages[currentIndex - 1];
    const tempNumber = 9999;

    await supabase.from("chapter_pages").update({ page_number: tempNumber }).eq("id", page.id);
    await supabase.from("chapter_pages").update({ page_number: page.page_number }).eq("id", previousPage.id);
    await supabase.from("chapter_pages").update({ page_number: previousPage.page_number }).eq("id", page.id);
    
    fetchPages();
  };

  const handleMoveDown = async (page: ChapterPage) => {
    const currentIndex = pages.findIndex(p => p.id === page.id);
    if (currentIndex >= pages.length - 1) return;
    
    const nextPage = pages[currentIndex + 1];
    const tempNumber = 9999;

    await supabase.from("chapter_pages").update({ page_number: tempNumber }).eq("id", page.id);
    await supabase.from("chapter_pages").update({ page_number: page.page_number }).eq("id", nextPage.id);
    await supabase.from("chapter_pages").update({ page_number: nextPage.page_number }).eq("id", page.id);
    
    fetchPages();
  };

  const handleDownload = (page: ChapterPage) => {
    const link = document.createElement('a');
    link.href = page.image_url;
    link.download = `page-${page.page_number}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    setDraggedPage(pageId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetPage: ChapterPage) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedPage || draggedPage === targetPage.id) {
      setDraggedPage(null);
      return;
    }

    const draggedIndex = pages.findIndex(p => p.id === draggedPage);
    const targetIndex = pages.findIndex(p => p.id === targetPage.id);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedPage(null);
      return;
    }

    const draggedPageNumber = pages[draggedIndex].page_number;
    const targetPageNumber = targetPage.page_number;

    // Use a temporary high number to avoid unique constraint violation
    const tempNumber = 9999;

    // Step 1: Move dragged page to temporary number
    const { error: error1 } = await supabase
      .from("chapter_pages")
      .update({ page_number: tempNumber })
      .eq("id", draggedPage);

    if (error1) {
      toast({
        variant: "destructive",
        title: "Error reordering pages",
        description: error1.message,
      });
      setDraggedPage(null);
      return;
    }

    // Step 2: Move target page to dragged page's old number
    const { error: error2 } = await supabase
      .from("chapter_pages")
      .update({ page_number: draggedPageNumber })
      .eq("id", targetPage.id);

    if (error2) {
      toast({
        variant: "destructive",
        title: "Error reordering pages",
        description: error2.message,
      });
      setDraggedPage(null);
      fetchPages();
      return;
    }

    // Step 3: Move dragged page to target page's number
    const { error: error3 } = await supabase
      .from("chapter_pages")
      .update({ page_number: targetPageNumber })
      .eq("id", draggedPage);

    if (error3) {
      toast({
        variant: "destructive",
        title: "Error reordering pages",
        description: error3.message,
      });
    } else {
      toast({ title: "Pages reordered successfully" });
    }

    setDraggedPage(null);
    fetchPages();
  };

  if (loading) return <div className="text-center py-8">Loading pages...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Chapter Pages ({pages.length})</h3>
        <div className="flex gap-2">
          <Label htmlFor={`upload-${chapterId}`} className="cursor-pointer">
            <Button type="button" disabled={uploading} asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Add Pages"}
              </span>
            </Button>
          </Label>
          <Input
            id={`upload-${chapterId}`}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pages.map((page) => (
          <Card 
            key={page.id} 
            className={`bg-gradient-card border-border/50 cursor-move transition-all hover:shadow-lg ${
              draggedPage === page.id ? 'opacity-50 scale-95' : 'opacity-100'
            }`}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, page.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, page)}
            onDragEnd={() => setDraggedPage(null)}
          >
            <CardHeader className="p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Page {page.page_number}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleMoveUp(page)}
                    disabled={pages.findIndex(p => p.id === page.id) === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleMoveDown(page)}
                    disabled={pages.findIndex(p => p.id === page.id) === pages.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDownload(page)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDelete(page)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <img
                src={page.image_url}
                alt={`Page ${page.page_number}`}
                className="w-full h-auto rounded"
              />
              <div className="mt-2 flex gap-1">
                <Input
                  type="number"
                  value={page.page_number}
                  onChange={(e) => handleReorder(page.id, parseInt(e.target.value))}
                  className="h-7 text-xs"
                  min={1}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pages.length === 0 && (
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="py-8 text-center text-muted-foreground">
            No pages uploaded yet. Click "Add Pages" to upload chapter pages.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChapterPageEditor;
