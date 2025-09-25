"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseVirtualScrollOptions {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualScroll({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualScrollOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Calculate virtual container height
  const totalHeight = itemCount * itemHeight;

  // Calculate offset for visible items
  const offsetY = startIndex * itemHeight;

  // Visible items indices
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    if (i >= 0 && i < itemCount) {
      visibleItems.push(i);
    }
  }

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop: currentScrollTop } = event.currentTarget;
    setScrollTop(currentScrollTop);
  }, []);

  // Scroll to item
  const scrollToItem = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      if (scrollElementRef.current) {
        const targetScrollTop = index * itemHeight;
        scrollElementRef.current.scrollTo({
          top: targetScrollTop,
          behavior,
        });
      }
    },
    [itemHeight]
  );

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToItem,
  };
}
