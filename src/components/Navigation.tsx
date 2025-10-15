import { Link, useLocation } from "react-router-dom";
import { BookOpen, Users, ShoppingBag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const location = useLocation();
  const [siteName, setSiteName] = useState("MangaVerse");
  const [navLabels, setNavLabels] = useState({
    home: "Home",
    series: "Series",
    authors: "Authors",
    merch: "Merch",
    about: "Our Story",
  });

  useEffect(() => {
    fetchNavSettings();
  }, []);

  const fetchNavSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["nav_site_name", "nav_home_label", "nav_series_label", "nav_authors_label", "nav_merch_label", "nav_about_label"]);

    if (data) {
      data.forEach((setting) => {
        const value = String(setting.value);
        if (setting.key === "nav_site_name") setSiteName(value);
        if (setting.key === "nav_home_label") setNavLabels(prev => ({ ...prev, home: value }));
        if (setting.key === "nav_series_label") setNavLabels(prev => ({ ...prev, series: value }));
        if (setting.key === "nav_authors_label") setNavLabels(prev => ({ ...prev, authors: value }));
        if (setting.key === "nav_merch_label") setNavLabels(prev => ({ ...prev, merch: value }));
        if (setting.key === "nav_about_label") setNavLabels(prev => ({ ...prev, about: value }));
      });
    }
  };

  const navItems = [
    { path: "/", label: navLabels.home, icon: null },
    { path: "/series", label: navLabels.series, icon: BookOpen },
    { path: "/authors", label: navLabels.authors, icon: Users },
    { path: "/merchandise", label: navLabels.merch, icon: ShoppingBag },
    { path: "/about", label: navLabels.about, icon: Info },
  ];

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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
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
