import { Link } from "react-router-dom";
import { Heart, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import siteIcon from "@/assets/site-icon.png";

const Footer = () => {
  const [siteName, setSiteName] = useState("");
  const [footerText, setFooterText] = useState("");

  useEffect(() => {
    fetchFooterContent();
  }, []);

  const fetchFooterContent = async () => {
    const { data } = await supabase
      .from("public_site_settings")
      .select("key, value")
      .in("key", ["nav_site_name", "footer_text"]);

    if (data) {
      data.forEach((item) => {
        try {
          const parsed = JSON.parse(String(item.value));
          if (item.key === "nav_site_name") setSiteName(String(parsed));
          if (item.key === "footer_text") setFooterText(String(parsed));
        } catch {
          if (item.key === "nav_site_name") setSiteName(String(item.value));
          if (item.key === "footer_text") setFooterText(String(item.value));
        }
      });
    }
  };

  return (
    <footer className="border-t border-border bg-secondary/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <img src={siteIcon} alt="Site Icon" className="h-8 w-8" />
              <div className="bg-gradient-primary bg-clip-text text-2xl font-bold text-transparent">
                {siteName || "Zanga"}
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              {footerText || "Bringing amazing manga to English-speaking audiences."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/series" className="hover:text-primary transition-colors">
                  Browse Series
                </Link>
              </li>
              <li>
                <Link to="/authors" className="hover:text-primary transition-colors">
                  Authors
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support Us</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Help us continue bringing great content to you
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Heart className="h-4 w-4" />
              Learn More
            </Link>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteName || "Zanga"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
