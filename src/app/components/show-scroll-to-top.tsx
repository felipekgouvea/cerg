"use client";

import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const ShowScrollToTop = () => {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <div>
      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <div className="fixed right-6 bottom-36 z-50">
          <Button
            onClick={scrollToTop}
            className="h-12 w-12 transform cursor-pointer rounded-full border-2 border-red-600 bg-white p-0 text-red-600 shadow-2xl transition-all hover:scale-110 hover:bg-gray-50 hover:shadow-xl"
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};
export default ShowScrollToTop;
