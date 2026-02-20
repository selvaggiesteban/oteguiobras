import { useEffect, useState, useRef } from 'react';

/**
 * Hook para detectar cuando un elemento entra en el viewport
 * Útil para activar animaciones cuando el usuario hace scroll
 * Usa callback ref para manejar elementos que se montan tarde
 */
export const useInView = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  // Callback ref que se ejecuta cuando el DOM element se monta/desmonta
  const setRef = useRef((node) => {
    // Limpiar observer anterior
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }

    elementRef.current = node;

    if (node && !isInView) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current) {
              observerRef.current.unobserve(node);
            }
          }
        },
        {
          threshold: options.threshold || 0.1,
          rootMargin: options.rootMargin || '0px',
        }
      );
      observerRef.current.observe(node);
    }
  }).current;

  useEffect(() => {
    return () => {
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }
    };
  }, []);

  return [setRef, isInView];
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

/**
 * Hook para scroll reveal con dirección y delay configurable
 * Retorna ref y className para aplicar directamente
 */
export const useScrollReveal = (direction = 'up', options = {}) => {
  const [ref, isInView] = useInView({ 
    threshold: options.threshold || 0.05,
    rootMargin: options.rootMargin || '0px 0px -30px 0px'
  });
  
  const baseClass = `scroll-reveal scroll-reveal-${direction}`;
  const className = isInView ? `${baseClass} revealed` : baseClass;
  
  return [ref, className, isInView];
};

/**
 * Hook para observar contenedor con stagger en hijos
 * Ideal para listas/grids - los hijos se animan en cascada
 * Usa callback ref para manejar elementos que se montan tarde
 */
export const useStaggerReveal = (options = {}) => {
  const [revealed, setRevealed] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  const setRef = useRef((node) => {
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }

    elementRef.current = node;

    if (node && !revealed) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (observerRef.current) {
              observerRef.current.unobserve(node);
            }
          }
        },
        {
          threshold: options.threshold || 0.1,
          rootMargin: options.rootMargin || '0px 0px -40px 0px'
        }
      );
      observerRef.current.observe(node);
    }
  }).current;

  useEffect(() => {
    return () => {
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }
    };
  }, []);

  return [setRef, revealed];
};
