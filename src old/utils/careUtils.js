// Function to format the date nicely
export const formatCareDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

// Function to get activity display info (emoji and clean name)
export const getActivityDisplay = (activityType) => {
  const displays = {
    'watering': { emoji: '💧', name: 'Watering' },
    'fertilizing': { emoji: '🌱', name: 'Fertilizing' },
    'pest-control': { emoji: '🐛', name: 'Pest Control' },
    'repotting': { emoji: '🏺', name: 'Repotting' },
    'structural-work': { emoji: '✂️', name: 'Structural Work' }
  };
  return displays[activityType] || { emoji: '🌿', name: activityType };
};

// Function to format price as currency
export const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') {
    return 'Not specified';
  }
  
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) {
    return 'Not specified';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(numPrice);
};