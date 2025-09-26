import React, { useState, useEffect } from 'react';
import PlantCard from './PlantCard';
import ExpandablePlantCard from './ExpandablePlantCard';

function ResponsivePlantCard(props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    // Check on mount
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Render appropriate card type based on screen size
  return isMobile ? (
    <ExpandablePlantCard {...props} />
  ) : (
    <PlantCard {...props} />
  );
}

export default ResponsivePlantCard;