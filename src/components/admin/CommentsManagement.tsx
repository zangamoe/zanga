import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { getUserFriendlyError } from "@/lib/errorHandler";

interface Comment {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
  chapter_id: string;
  chapter_title?: string;
  series_title?: string;
  series_id?: string;
}

const CommentsManagement = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const { data: commentsData } = await supabase
      .from("chapter_comments")
      .select(`
        *,
        chapters:chapter_id (
          title,
          series_id,
          series:series_id (
            title
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (commentsData) {
      const formattedComments = commentsData.map((comment: any) => ({
        id: comment.id,
        user_id: comment.user_id,
        comment: comment.comment,
        created_at: comment.created_at,
        chapter_id: comment.chapter_id,
        chapter_title: comment.chapters?.title,
        series_title: comment.chapters?.series?.title,
        series_id: comment.chapters?.series_id,
      }));
      setComments(formattedComments);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const { error } = await supabase
      .from("chapter_comments")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(getUserFriendlyError(error));
    } else {
      toast.success("Comment deleted");
      fetchComments();
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chapter Comments
        </CardTitle>
        <CardDescription>
          View and manage all user comments across all chapters
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground">No comments yet</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-lg bg-secondary/20 border border-border/30"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">
                      {comment.series_title} - {comment.chapter_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommentsManagement;
