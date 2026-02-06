import { useEffect, useState, useRef } from 'react';

/**
 * Hook para detectar cuando un elemento entra en el viewport
 * Útil para activar animaciones cuando el usuario hace scroll
 */
export const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Solo activar una vez cuando entra en vista
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [isInView, options.threshold, options.rootMargin]);

  return [elementRef, isInView];
};

/**
 * Hook para detectar el tamaño de la ventana
 * Útil para responsive design y condicionales basadas en viewport
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

/**
 * Hook para detectar scroll direction
 * Útil para ocultar/mostrar header al hacer scroll
 */
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [prevOffset, setPrevOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;
      
      if (currentOffset > prevOffset) {
        setScrollDirection('down');
      } else if (currentOffset < prevOffset) {
        setScrollDirection('up');
      }
      
      setPrevOffset(currentOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevOffset]);

  return scrollDirection;
};

/**
 * Hook para prefetch de imágenes
 * Útil para cargar imágenes antes de mostrarlas
 */
export const usePrefetchImages = (imageUrls) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(src);
        img.src = src;
      });
    };

    Promise.all(imageUrls.map(loadImage))
      .then(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      })
      .catch((error) => {
        console.warn('Error loading images:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrls]);

  return loaded;
};
