import React from 'react';
import PlantManager from './PlantManager';

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden">
  {/* Background Image Layer */}
  <div 
    className="absolute inset-0 w-full h-full"
    style={{
      backgroundImage: "url('/images/BGportphoto.png')",
      backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      transform: "scale(1.1)" // Slight oversizing to eliminate gaps
    }}
  />
  
     {/* Semi-transparent overlay */}
  <div className="absolute inset-0 bg-white bg-opacity-60"></div>
  
  {/* Your content */}
  <div className="relative z-10">
    <PlantManager />
  </div>
</div>

  );
}

export default App;