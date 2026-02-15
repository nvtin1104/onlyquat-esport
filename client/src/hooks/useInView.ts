'use client';

import { useState, useEffect, useRef, type RefObject } from 'react';

export function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.2, ...options });

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
}
