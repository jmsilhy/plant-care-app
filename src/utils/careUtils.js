// Function to format the date nicely
export const formatCareDate = (date_string) => {
  const date = new Date(date_string);
  const now = new Date();
  const diff_in_hours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diff_in_hours < 24) {
    return `${diff_in_hours}h ago`;
  } else {
    const diff_in_days = Math.floor(diff_in_hours / 24);
    return `${diff_in_days}d ago`;
  }
};

// Function to get activity display info (emoji and clean name)
export const getActivityDisplay = (activity_type) => {
  const displays = {
    'watering': { emoji: '💧', name: 'Watering' },
    'fertilizing': { emoji: '🌱', name: 'Fertilizing' },
    'pest-control': { emoji: '🐛', name: 'Pest Control' },
    'repotting': { emoji: '🏺', name: 'Repotting' },
    'structural-work': { emoji: '✂️', name: 'Structural Work' }
  };
  return displays[activity_type] || { emoji: '🌿', name: activity_type };
};

// Function to format price as currency
export const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') {
    return 'Not specified';
  }
  
  const num_price = parseFloat(price);
  if (isNaN(num_price)) {
    return 'Not specified';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(num_price);
};