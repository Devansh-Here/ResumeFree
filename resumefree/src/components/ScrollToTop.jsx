// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Give the target page (e.g. Landing, after navigating from another
      // route) a moment to actually render its sections before we try to
      // find the element — otherwise the target id might not exist in the
      // DOM yet on the very first paint.
      const id = hash.replace("#", "");
      const scrollToHash = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return true;
        }
        return false;
      };

      if (!scrollToHash()) {
        const timeout = setTimeout(scrollToHash, 100);
        return () => clearTimeout(timeout);
      }
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}