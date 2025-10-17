import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const MetadataUpdater = () => {
  useEffect(() => {
    const fetchAndUpdateMetadata = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", ["site_title", "site_description", "site_favicon_url", "site_og_image_url"]);

        if (error) {
          console.error("Error fetching metadata:", error);
          return;
        }

        const metadataMap: Record<string, string> = {};
        data?.forEach((item) => {
          try {
            const value = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
            metadataMap[item.key] = JSON.parse(value);
          } catch {
            metadataMap[item.key] = String(item.value);
          }
        });

        // Update document title
        if (metadataMap.site_title) {
          document.title = metadataMap.site_title;
        }

        // Update meta description
        if (metadataMap.site_description) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute("content", metadataMap.site_description);
          } else {
            metaDesc = document.createElement("meta");
            metaDesc.setAttribute("name", "description");
            metaDesc.setAttribute("content", metadataMap.site_description);
            document.head.appendChild(metaDesc);
          }

          // Update OG description
          let ogDesc = document.querySelector('meta[property="og:description"]');
          if (ogDesc) {
            ogDesc.setAttribute("content", metadataMap.site_description);
          }

          // Update Twitter description
          let twitterDesc = document.querySelector('meta[name="twitter:description"]');
          if (twitterDesc) {
            twitterDesc.setAttribute("content", metadataMap.site_description);
          }
        }

        // Update favicon
        if (metadataMap.site_favicon_url) {
          let favicon = document.querySelector('link[rel="icon"]');
          if (favicon) {
            favicon.setAttribute("href", metadataMap.site_favicon_url);
          } else {
            favicon = document.createElement("link");
            favicon.setAttribute("rel", "icon");
            favicon.setAttribute("type", "image/x-icon");
            favicon.setAttribute("href", metadataMap.site_favicon_url);
            document.head.appendChild(favicon);
          }
        }

        // Update OG image
        if (metadataMap.site_og_image_url) {
          let ogImage = document.querySelector('meta[property="og:image"]');
          if (ogImage) {
            ogImage.setAttribute("content", metadataMap.site_og_image_url);
          }

          let twitterImage = document.querySelector('meta[name="twitter:image"]');
          if (twitterImage) {
            twitterImage.setAttribute("content", metadataMap.site_og_image_url);
          }
        }
      } catch (error) {
        console.error("Error updating metadata:", error);
      }
    };

    fetchAndUpdateMetadata();
  }, []);

  return null;
};

export default MetadataUpdater;
