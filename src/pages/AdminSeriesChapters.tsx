import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ChapterManagement from "@/components/admin/ChapterManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Series {
  id: string;
  title: string;
  cover_image_url: string;
}

const AdminSeriesChapters = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (seriesId) {
      fetchSeries();
    }
  }, [seriesId]);

  const fetchSeries = async () => {
    if (!seriesId) return;

    const { data, error } = await supabase
      .from("series")
      .select("id, title, cover_image_url")
      .eq("id", seriesId)
      .single();

    if (!error && data) {
      setSeries(data);
    }
    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Series not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <div className="flex items-center gap-4">
            <img
              src={series.cover_image_url}
              alt={series.title}
              className="w-20 h-28 object-cover rounded"
            />
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                Manage Chapters
              </h1>
              <p className="text-muted-foreground text-lg">
                {series.title}
              </p>
            </div>
          </div>
        </div>

        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Chapters & Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <ChapterManagement seriesId={seriesId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSeriesChapters;
