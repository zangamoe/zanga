import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, BookOpen, Users, ShoppingBag, Settings, Layout, Info, MessageCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import AuthorManagement from "@/components/admin/AuthorManagement";
import SeriesManagement from "@/components/admin/SeriesManagement";
import MerchandiseManagement from "@/components/admin/MerchandiseManagement";
import SiteContentManagement from "@/components/admin/SiteContentManagement";
import AdminGuide from "@/components/admin/AdminGuide";
import MenuManagement from "@/components/admin/MenuManagement";
import HomepagePageContent from "@/components/admin/HomepagePageContent";
import SeriesPageContent from "@/components/admin/SeriesPageContent";
import SeriesDetailPageContent from "@/components/admin/SeriesDetailPageContent";
import AuthorsPageContent from "@/components/admin/AuthorsPageContent";
import MerchandisePageContent from "@/components/admin/MerchandisePageContent";
import SpecificSeriesEditor from "@/components/admin/SpecificSeriesEditor";
import SpecificAuthorEditor from "@/components/admin/SpecificAuthorEditor";
import OurStoryManagement from "@/components/admin/OurStoryManagement";
import DiscordManagement from "@/components/admin/DiscordManagement";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [authorsList, setAuthorsList] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchSeriesList();
      fetchAuthorsList();
    }
  }, [isAdmin]);

  const fetchSeriesList = async () => {
    const { data } = await supabase
      .from("series")
      .select("id, title, cover_image_url")
      .order("title");
    if (data) setSeriesList(data);
  };

  const fetchAuthorsList = async () => {
    const { data } = await supabase
      .from("authors")
      .select("id, name, profile_picture_url")
      .order("name");
    if (data) setAuthorsList(data);
  };

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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-secondary/50">
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Guide
            </TabsTrigger>
            <TabsTrigger value="site-content" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Site
            </TabsTrigger>
            <TabsTrigger value="our-story" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Our Story
            </TabsTrigger>
            <TabsTrigger value="discord" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Discord
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
          </TabsList>

          <TabsContent value="guide">
            <AdminGuide />
          </TabsContent>

          <TabsContent value="site-content">
            <Card className="bg-gradient-card border-border/50 mb-6">
              <CardHeader>
                <CardTitle>Site Settings & Navigation</CardTitle>
                <CardDescription>
                  Manage site-wide settings including site name, logo, and navigation menu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">General Settings</TabsTrigger>
                    <TabsTrigger value="menu">Navigation Menu</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general">
                    <SiteContentManagement />
                  </TabsContent>
                  <TabsContent value="menu">
                    <MenuManagement />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="our-story">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Our Story Page Content</CardTitle>
                <CardDescription>
                  Edit all content that appears on the "Our Story" (About) page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OurStoryManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discord">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Discord Page Content</CardTitle>
                <CardDescription>
                  Manage all content for the Discord community page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DiscordManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homepage">
            <div className="space-y-6">
              <HomepagePageContent />
            </div>
          </TabsContent>

          <TabsContent value="series">
            {selectedSeriesId ? (
              <SpecificSeriesEditor 
                seriesId={selectedSeriesId} 
                onBack={() => setSelectedSeriesId(null)} 
              />
            ) : (
              <div className="space-y-6">
                <Card className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <CardTitle>Series Management</CardTitle>
                    <CardDescription>Select a series to edit its specific content, or manage all series below</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="general" className="space-y-6">
                   <TabsList className="grid w-full grid-cols-2">
                     <TabsTrigger value="general">General Settings</TabsTrigger>
                     <TabsTrigger value="manage">Manage Series</TabsTrigger>
                   </TabsList>
                   
                   <TabsContent value="general">
                     <div className="space-y-6">
                       <SeriesPageContent />
                       <SeriesDetailPageContent />
                     </div>
                   </TabsContent>
                   
                   <TabsContent value="manage">
                     <div className="space-y-6">
                       <SeriesManagement />
                       {seriesList.length > 0 && (
                         <div className="space-y-4">
                           <h3 className="text-lg font-semibold">Select a Series to Edit</h3>
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                             {seriesList.map((series) => (
                               <Card
                                 key={series.id}
                                 className="cursor-pointer hover:shadow-glow transition-all bg-gradient-card border-border/50 group overflow-hidden"
                                 onClick={() => setSelectedSeriesId(series.id)}
                               >
                                 <CardContent className="p-0">
                                   <img
                                     src={series.cover_image_url}
                                     alt={series.title}
                                     className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                                   />
                                   <div className="p-3">
                                     <h4 className="font-semibold text-sm text-center line-clamp-2">{series.title}</h4>
                                   </div>
                                 </CardContent>
                               </Card>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                   </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="authors">
            {selectedAuthorId ? (
              <SpecificAuthorEditor 
                authorId={selectedAuthorId} 
                onBack={() => setSelectedAuthorId(null)} 
              />
            ) : (
              <div className="space-y-6">
                <Card className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <CardTitle>Authors Management</CardTitle>
                    <CardDescription>Select an author to edit their specific page content, or manage all authors below</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="general" className="space-y-6">
                   <TabsList className="grid w-full grid-cols-2">
                     <TabsTrigger value="general">General Settings</TabsTrigger>
                     <TabsTrigger value="manage">Manage Authors</TabsTrigger>
                   </TabsList>
                   
                   <TabsContent value="general">
                     <AuthorsPageContent />
                   </TabsContent>
                   
                   <TabsContent value="manage">
                     <div className="space-y-6">
                       <AuthorManagement />
                       {authorsList.length > 0 && (
                         <div className="space-y-4">
                           <h3 className="text-lg font-semibold">Select an Author to Edit</h3>
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                             {authorsList.map((author) => (
                               <Card
                                 key={author.id}
                                 className="cursor-pointer hover:shadow-glow transition-all bg-gradient-card border-border/50 group"
                                 onClick={() => setSelectedAuthorId(author.id)}
                               >
                                 <CardContent className="p-3 text-center">
                                   {author.profile_picture_url ? (
                                     <img
                                       src={author.profile_picture_url}
                                       alt={author.name}
                                       className="w-32 h-32 mx-auto object-cover rounded-full mb-2 group-hover:scale-105 transition-transform"
                                     />
                                   ) : (
                                     <div className="w-32 h-32 mx-auto bg-muted rounded-full mb-2 flex items-center justify-center">
                                       <span className="text-3xl font-bold text-muted-foreground">
                                         {author.name.charAt(0)}
                                       </span>
                                     </div>
                                   )}
                                   <h4 className="font-semibold text-sm line-clamp-2">{author.name}</h4>
                                 </CardContent>
                               </Card>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                   </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="merchandise">
            <div className="space-y-6">
              <MerchandisePageContent />
              <MerchandiseManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
