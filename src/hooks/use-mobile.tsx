import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        const ua = navigator.userAgent;
        
        setScreenWidth(width);
        setUserAgent(ua);
        setIsMobile(width <= 768);
        setIsTablet(width > 768 && width <= 1024);
        
        // Detectar dispositivos móveis específicos
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        const isSmallScreen = width <= 768;
        
        // Forçar mobile se for dispositivo móvel OU tela pequena
        if (isMobileDevice || isSmallScreen) {
          setIsMobile(true);
        }
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenWidth,
    userAgent,
    isMobileDevice: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  };
};

export default useMobile;
