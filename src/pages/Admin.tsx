import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, BookOpen, Users, ShoppingBag, Settings, Layout, Info, Menu } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthorManagement from "@/components/admin/AuthorManagement";
import SeriesManagement from "@/components/admin/SeriesManagement";
import MerchandiseManagement from "@/components/admin/MerchandiseManagement";
import SiteContentManagement from "@/components/admin/SiteContentManagement";
import HomepageBlocksManagement from "@/components/admin/HomepageBlocksManagement";
import AdminGuide from "@/components/admin/AdminGuide";
import SeriesPageContent from "@/components/admin/SeriesPageContent";
import AuthorsPageContent from "@/components/admin/AuthorsPageContent";
import MerchandisePageContent from "@/components/admin/MerchandisePageContent";
import HomepagePageContent from "@/components/admin/HomepagePageContent";
import HeroSliderManagement from "@/components/admin/HeroSliderManagement";
import MenuManagement from "@/components/admin/MenuManagement";

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

        <Tabs defaultValue="guide" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-secondary/50">
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Guide
            </TabsTrigger>
            <TabsTrigger value="site-content" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Site
            </TabsTrigger>
            <TabsTrigger value="homepage" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Homepage
            </TabsTrigger>
            <TabsTrigger value="series" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Series
            </TabsTrigger>
            <TabsTrigger value="authors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Authors
            </TabsTrigger>
            <TabsTrigger value="merchandise" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Merch
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              Menu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guide">
            <AdminGuide />
          </TabsContent>

          <TabsContent value="site-content">
            <SiteContentManagement />
          </TabsContent>

          <TabsContent value="homepage">
            <Tabs defaultValue="content" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Page Content</TabsTrigger>
                <TabsTrigger value="slider">Hero Slider</TabsTrigger>
              </TabsList>
              <TabsContent value="content">
                <HomepagePageContent />
              </TabsContent>
              <TabsContent value="slider">
                <HeroSliderManagement />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="series">
            <SeriesPageContent />
            <div className="mt-6">
              <SeriesManagement />
            </div>
          </TabsContent>

          <TabsContent value="authors">
            <AuthorsPageContent />
            <div className="mt-6">
              <AuthorManagement />
            </div>
          </TabsContent>

          <TabsContent value="merchandise">
            <MerchandisePageContent />
            <div className="mt-6">
              <MerchandiseManagement />
            </div>
          </TabsContent>

          <TabsContent value="menu">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Navigation Menu</CardTitle>
                <CardDescription>
                  Customize the top navigation bar items - edit labels, paths, and order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MenuManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
