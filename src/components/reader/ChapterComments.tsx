import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { commentSchema, validateInput } from "@/lib/validation";

interface Comment {
  id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

interface Reaction {
  id: string;
  user_id: string;
  emoji: string;
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

const ChapterComments = ({ chapterId }: { chapterId: string }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
    fetchReactions();
  }, [chapterId]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("chapter_comments")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("created_at", { ascending: false });
    
    if (data) setComments(data);
  };

  const fetchReactions = async () => {
    const { data } = await supabase
      .from("chapter_reactions")
      .select("*")
      .eq("chapter_id", chapterId);
    
    if (data) setReactions(data);
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    // Validate comment with security checks
    const validation = validateInput(commentSchema, { comment: newComment });
    if (validation.success === false) {
      toast.error(validation.error);
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("chapter_comments")
      .insert({
        chapter_id: chapterId,
        user_id: user.id,
        comment: validation.data.comment
      });

    if (error) {
      toast.error("Failed to post comment");
    } else {
      toast.success("Comment posted!");
      setNewComment("");
      fetchComments();
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from("chapter_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast.error("Failed to delete comment");
    } else {
      toast.success("Comment deleted");
      fetchComments();
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!user) {
      toast.error("Please sign in to react");
      return;
    }

    const existing = reactions.find(r => r.user_id === user.id && r.emoji === emoji);
    
    if (existing) {
      await supabase
        .from("chapter_reactions")
        .delete()
        .eq("id", existing.id);
    } else {
      await supabase
        .from("chapter_reactions")
        .insert({
          chapter_id: chapterId,
          user_id: user.id,
          emoji
        });
    }
    
    fetchReactions();
  };

  const getReactionCount = (emoji: string) => {
    return reactions.filter(r => r.emoji === emoji).length;
  };

  const hasUserReacted = (emoji: string) => {
    return reactions.some(r => r.user_id === user?.id && r.emoji === emoji);
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments & Reactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reactions */}
        <div className="flex gap-2 flex-wrap">
          {EMOJI_OPTIONS.map((emoji) => (
            <Button
              key={emoji}
              variant={hasUserReacted(emoji) ? "default" : "outline"}
              size="sm"
              onClick={() => handleReaction(emoji)}
              className="text-lg"
            >
              {emoji} {getReactionCount(emoji) > 0 && getReactionCount(emoji)}
            </Button>
          ))}
        </div>

        {/* Comment Form */}
        <div className="space-y-3">
          <Textarea
            placeholder={user ? "Share your thoughts... (max 1000 characters)" : "Sign in to comment"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user || loading}
            className="min-h-[100px]"
            maxLength={1000}
          />
          <Button
            onClick={handleSubmitComment}
            disabled={!user || loading || !newComment.trim()}
            className="bg-gradient-primary"
          >
            Post Comment
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-lg bg-secondary/20 border border-border/30"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                  <p className="text-foreground whitespace-pre-wrap">{comment.comment}</p>
                </div>
                {(user?.id === comment.user_id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChapterComments;
