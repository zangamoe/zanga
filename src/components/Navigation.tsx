import { Link, useLocation } from "react-router-dom";
import { BookOpen, Users, ShoppingBag, Info, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MenuItem {
  id: string;
  label: string;
  path: string;
  order_index: number;
  enabled: boolean;
}

// Map paths to icons
const getIconForPath = (path: string) => {
  switch (path) {
    case '/series':
      return BookOpen;
    case '/authors':
      return Users;
    case '/merchandise':
      return ShoppingBag;
    case '/about':
      return Info;
    default:
      return null;
  }
};

const Navigation = () => {
  const location = useLocation();
  const [siteName, setSiteName] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (siteName) {
      document.title = siteName;
    }
  }, [siteName]);

  const fetchNavigationData = async () => {
    // Fetch site name from public view
    const { data: siteNameData } = await supabase
      .from("public_site_settings")
      .select("key, value")
      .eq("key", "nav_site_name")
      .maybeSingle();

    if (siteNameData) {
      try {
        const parsed = JSON.parse(String(siteNameData.value));
        setSiteName(String(parsed));
      } catch {
        setSiteName(String(siteNameData.value));
      }
    }

    // Fetch menu items
    const { data: menuData } = await supabase
      .from("menu_items")
      .select("*")
      .eq("enabled", true)
      .order("order_index");

    if (menuData && menuData.length > 0) {
      setMenuItems(menuData);
    }
  };

  useEffect(() => {
    fetchNavigationData();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-14 md:h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            {siteName && (
              <div className="bg-gradient-primary bg-clip-text text-xl md:text-2xl font-bold text-transparent">
                {siteName}
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = getIconForPath(item.path);
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.id}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className={isActive ? "bg-gradient-primary" : ""}
                >
                  <Link to={item.path} className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => {
                  const Icon = getIconForPath(item.path);
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Button
                      key={item.id}
                      asChild
                      variant={isActive ? "default" : "ghost"}
                      className={`justify-start ${isActive ? "bg-gradient-primary" : ""}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to={item.path} className="flex items-center gap-2">
                        {Icon && <Icon className="h-5 w-5" />}
                        <span className="text-lg">{item.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
