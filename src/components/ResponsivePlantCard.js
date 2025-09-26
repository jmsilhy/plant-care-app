import React, { useState, useEffect } from 'react';
import PlantCard from './PlantCard';
import ExpandablePlantCard from './ExpandablePlantCard';
import TabletPlantCard from './TabletPlantCard';

function ResponsivePlantCard(props) {
  const [device_type, setDeviceType] = useState('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const is_touch_device = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const screen_width = window.innerWidth;
      
      if (!is_touch_device || screen_width >= 1200) {
        // Desktop: Large screens OR non-touch devices
        setDeviceType('desktop');
      } else if (screen_width >= 768) {
        // Tablet: Touch device with medium screen
        setDeviceType('tablet');
      } else {
        // Mobile: Touch device with small screen
        setDeviceType('mobile');
      }
    };

    // Check on mount
    checkDeviceType();

    // Listen for resize events
    window.addEventListener('resize', checkDeviceType);

    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Render appropriate card type based on device type
  switch (device_type) {
    case 'mobile':
      return <ExpandablePlantCard {...props} />;
    case 'tablet':
      return <TabletPlantCard {...props} />;
    case 'desktop':
    default:
      return <PlantCard {...props} />;
  }
}

export default ResponsivePlantCard;