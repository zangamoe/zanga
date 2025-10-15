import { Link, useLocation } from "react-router-dom";
import { BookOpen, Users, ShoppingBag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [siteName, setSiteName] = useState("MangaVerse");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetchNavigationData();
  }, []);

  const fetchNavigationData = async () => {
    // Fetch site name
    const { data: siteNameData } = await supabase
      .from("site_settings")
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

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-primary bg-clip-text text-2xl font-bold text-transparent">
              {siteName}
            </div>
          </Link>

          <div className="flex items-center gap-1">
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
