import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Merchandise {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  purchase_url: string | null;
}

const Merchandise = () => {
  const [products, setProducts] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageContent, setPageContent] = useState({
    title: "Merchandise",
    subtitle: "Support our authors by purchasing official merchandise. From manga volumes to art books and apparel, every purchase helps these talented artists continue their creative journey.",
    emptyText: "No merchandise available yet. Check back soon!",
    emptySubtitle: "Admins can add merchandise from the Admin Panel.",
    ctaTitle: "Looking for something specific?",
    ctaText: "We're always expanding our merchandise collection. If you have suggestions for products you'd like to see, reach out to us!",
    ctaButton: "Contact Us",
    buyButton: "Buy Now",
    comingSoon: "Link Coming Soon",
  });

  useEffect(() => {
    fetchMerchandise();
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["merch_page_title", "merch_page_subtitle", "merch_empty_text", "merch_empty_subtitle", "merch_cta_title", "merch_cta_text", "merch_cta_button", "merch_buy_button", "merch_coming_soon"]);

    if (data) {
      const newContent = { ...pageContent };
      data.forEach((item) => {
        const value = String(item.value);
        if (item.key === "merch_page_title") newContent.title = value;
        if (item.key === "merch_page_subtitle") newContent.subtitle = value;
        if (item.key === "merch_empty_text") newContent.emptyText = value;
        if (item.key === "merch_empty_subtitle") newContent.emptySubtitle = value;
        if (item.key === "merch_cta_title") newContent.ctaTitle = value;
        if (item.key === "merch_cta_text") newContent.ctaText = value;
        if (item.key === "merch_cta_button") newContent.ctaButton = value;
        if (item.key === "merch_buy_button") newContent.buyButton = value;
        if (item.key === "merch_coming_soon") newContent.comingSoon = value;
      });
      setPageContent(newContent);
    }
  };

  const fetchMerchandise = async () => {
    const { data } = await supabase
      .from("merchandise")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {pageContent.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            {pageContent.subtitle}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">{pageContent.emptyText}</p>
            <p className="text-sm text-muted-foreground mt-2">{pageContent.emptySubtitle}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group overflow-hidden bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
                <div className="aspect-[2/3] overflow-hidden relative">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-secondary/20 flex items-center justify-center">
                      <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  {product.price && (
                    <p className="text-2xl font-bold text-primary mb-4">
                      ${product.price.toFixed(2)}
                    </p>
                  )}
                  {product.purchase_url ? (
                    <Button 
                      asChild
                      className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                    >
                      <a href={product.purchase_url} target="_blank" rel="noopener noreferrer">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {pageContent.buyButton}
                      </a>
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      {pageContent.comingSoon}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-16 bg-secondary/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{pageContent.ctaTitle}</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {pageContent.ctaText}
          </p>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <ExternalLink className="h-4 w-4 mr-2" />
            {pageContent.ctaButton}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Merchandise;
