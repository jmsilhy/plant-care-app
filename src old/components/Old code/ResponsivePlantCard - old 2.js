import React, { useState, useEffect } from 'react';
import PlantCard from './PlantCard';
import ExpandablePlantCard from './ExpandablePlantCard';

function ResponsivePlantCard(props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDeviceType = () => {
      // Check for touch capability AND screen size
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 1024; // Use lg breakpoint instead of md
      
      // Use expandable cards for touch devices OR small screens
      setIsMobile(isTouchDevice && isSmallScreen);
    };

    // Check on mount
    checkDeviceType();

    // Listen for resize events
    window.addEventListener('resize', checkDeviceType);

    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Render appropriate card type based on device and screen size
  return isMobile ? (
    <ExpandablePlantCard {...props} />
  ) : (
    <PlantCard {...props} />
  );
}

export default ResponsivePlantCard;