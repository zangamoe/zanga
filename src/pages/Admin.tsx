import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, BookOpen, Users, ShoppingBag, Image } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthorManagement from "@/components/admin/AuthorManagement";
import SeriesManagement from "@/components/admin/SeriesManagement";
import ChapterManagement from "@/components/admin/ChapterManagement";
import MerchandiseManagement from "@/components/admin/MerchandiseManagement";

const Admin = () => {
  const { user, loading, isAdmin, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <Card className="max-w-md mx-auto bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                Access Denied
              </CardTitle>
              <CardDescription>
                You don't have admin permissions. Please contact the site administrator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={signOut} variant="outline" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Manage your manga website content
            </p>
          </div>
          <Button onClick={signOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="series" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="series" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Series
            </TabsTrigger>
            <TabsTrigger value="authors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Authors
            </TabsTrigger>
            <TabsTrigger value="chapters" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Chapters
            </TabsTrigger>
            <TabsTrigger value="merchandise" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Merchandise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="series">
            <SeriesManagement />
          </TabsContent>

          <TabsContent value="authors">
            <AuthorManagement />
          </TabsContent>

          <TabsContent value="chapters">
            <ChapterManagement />
          </TabsContent>

          <TabsContent value="merchandise">
            <MerchandiseManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
