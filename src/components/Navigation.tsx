import { Link, useLocation } from "react-router-dom";
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

          <div className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive 
                      ? "text-primary" 
                      : "text-foreground/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu - simplified */}
          <div className="md:hidden flex items-center gap-2">
            {menuItems.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="text-sm text-foreground/60 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
