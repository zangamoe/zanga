import { Link, useLocation } from "react-router-dom";
import { BookOpen, Users, ShoppingBag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: null },
    { path: "/series", label: "Series", icon: BookOpen },
    { path: "/authors", label: "Authors", icon: Users },
    { path: "/merchandise", label: "Merch", icon: ShoppingBag },
    { path: "/about", label: "Our Story", icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-primary bg-clip-text text-2xl font-bold text-transparent">
              MangaVerse
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
