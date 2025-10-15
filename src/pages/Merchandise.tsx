import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink } from "lucide-react";

const Merchandise = () => {
  const products = [
    {
      id: 1,
      name: "Chronicles of the Azure Sky - Vol. 1",
      price: "$14.99",
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
      category: "Manga",
      available: true,
    },
    {
      id: 2,
      name: "Moonlit Memories Poster Set",
      price: "$24.99",
      image: "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=400&h=600&fit=crop",
      category: "Poster",
      available: true,
    },
    {
      id: 3,
      name: "Neon Requiem Art Book",
      price: "$29.99",
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
      category: "Art Book",
      available: true,
    },
    {
      id: 4,
      name: "Azure Sky Character T-Shirt",
      price: "$19.99",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=600&fit=crop",
      category: "Apparel",
      available: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Merchandise
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Support our authors by purchasing official merchandise. From manga volumes to art books and apparel, every purchase helps these talented artists continue their creative journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
              <div className="aspect-[2/3] overflow-hidden relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {!product.available && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Badge variant="secondary" className="text-lg">
                      Coming Soon
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <Badge variant="outline" className="mb-2">
                  {product.category}
                </Badge>
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-2xl font-bold text-primary mb-4">
                  {product.price}
                </p>
                <Button 
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  disabled={!product.available}
                >
                  {product.available ? (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  ) : (
                    "Coming Soon"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-secondary/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Looking for something specific?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're always expanding our merchandise collection. If you have suggestions for products you'd like to see, reach out to us!
          </p>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <ExternalLink className="h-4 w-4 mr-2" />
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Merchandise;
