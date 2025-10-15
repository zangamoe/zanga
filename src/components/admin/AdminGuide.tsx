import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, CheckCircle2 } from "lucide-react";

const AdminGuide = () => {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This admin panel lets you control <strong>everything</strong> on your website without touching code. All changes are instant!
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Site Content Tab
            </CardTitle>
            <CardDescription>Edit text, images, and settings across all pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>home_hero_title:</strong> Main homepage headline</p>
            <p><strong>home_hero_subtitle:</strong> Homepage subtitle text</p>
            <p><strong>home_hero_badge:</strong> Small badge text above title</p>
            <p><strong>home_hero_image:</strong> Hero background image</p>
            <p><strong>home_hero_button_text:</strong> Main call-to-action button</p>
            <p><strong>latest_releases_title:</strong> Section title for latest series</p>
            <p><strong>featured_section_title:</strong> Title for featured blocks</p>
            <p><strong>home_about_title:</strong> Bottom section title</p>
            <p><strong>home_about_text:</strong> Bottom section description</p>
            <p><strong>site_title:</strong> Website name (appears in navigation)</p>
            <p><strong>footer_text:</strong> Copyright text in footer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Homepage Tab
            </CardTitle>
            <CardDescription>Manage featured content blocks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Featured Blocks:</strong> Create promotional cards with images, titles, and links</p>
            <p><strong>Title:</strong> Main heading for the block</p>
            <p><strong>Subtitle:</strong> Optional subheading</p>
            <p><strong>Image:</strong> Upload a featured image</p>
            <p><strong>Link URL:</strong> Where the "Learn More" button goes</p>
            <p><strong>Excerpt:</strong> Description text</p>
            <p><strong>Enable/Disable:</strong> Show or hide blocks instantly</p>
            <p><strong>Order:</strong> Drag to reorder (coming soon)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Series Tab
            </CardTitle>
            <CardDescription>Add and manage manga series</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Add Series:</strong> Upload cover, title, synopsis, and status</p>
            <p><strong>Status:</strong> Set as ongoing, completed, or hiatus</p>
            <p><strong>Auto-Display:</strong> New series automatically appear on homepage and series page</p>
            <p><strong>Cover Images:</strong> Upload beautiful cover art</p>
            <p className="text-muted-foreground italic mt-4">
              The 3 most recent series automatically show in "Latest Releases" on homepage!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Chapters Tab
            </CardTitle>
            <CardDescription>Upload manga chapters and pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Select Series:</strong> Choose which series the chapter belongs to</p>
            <p><strong>Chapter Number:</strong> Sequential numbering</p>
            <p><strong>Chapter Title:</strong> Optional custom title</p>
            <p><strong>Upload Pages:</strong> Add multiple page images</p>
            <p><strong>Page Order:</strong> Automatically numbered in sequence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Authors Tab
            </CardTitle>
            <CardDescription>Manage manga creator profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Author Profiles:</strong> Add bio, profile picture, and social links</p>
            <p><strong>Social Media:</strong> Connect Twitter, Instagram, website links</p>
            <p><strong>Link to Series:</strong> Associate authors with their works</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Merchandise Tab
            </CardTitle>
            <CardDescription>Sell physical and digital products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Add Products:</strong> Upload images, descriptions, and prices</p>
            <p><strong>Purchase URL:</strong> Link to external store or checkout</p>
            <p><strong>Pricing:</strong> Set your own prices</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong className="text-primary">🎨 Images:</strong> Upload images in Site Content or Homepage tabs. They work immediately!
          </div>
          <div>
            <strong className="text-primary">✏️ Text Editing:</strong> All text fields support HTML for bold, italics, line breaks, etc.
          </div>
          <div>
            <strong className="text-primary">🔄 Live Updates:</strong> Changes appear instantly on your website. No need to refresh!
          </div>
          <div>
            <strong className="text-primary">📱 Responsive:</strong> Everything automatically looks great on mobile and desktop.
          </div>
          <div>
            <strong className="text-primary">🎯 Latest Releases:</strong> Your 3 newest series automatically show on homepage. Just add series in Series tab!
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGuide;