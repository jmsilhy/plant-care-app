// utils/securityUtils.js

/**
 * Sanitize text input to prevent XSS attacks
 * Removes potentially dangerous HTML/JavaScript while preserving safe characters
 */
export const sanitizeText = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove HTML tags except basic formatting
    .replace(/<(?!\/?(b|i|em|strong|br)\b)[^>]*>/gi, '')
    // Limit length to prevent abuse
    .substring(0, 1000)
    // Trim whitespace
    .trim();
};

/**
 * Sanitize and validate plant name
 */
export const validatePlantName = (name) => {
  const sanitized = sanitizeText(name);
  
  if (!sanitized || sanitized.length < 1) {
    throw new Error('Plant name is required');
  }
  
  if (sanitized.length > 100) {
    throw new Error('Plant name must be less than 100 characters');
  }
  
  // Check for suspicious patterns
  if (/[<>{}[\]\\\/]/.test(sanitized)) {
    throw new Error('Plant name contains invalid characters');
  }
  
  return sanitized;
};

/**
 * Sanitize and validate notes/captions
 */
export const validateNotes = (notes) => {
  if (!notes) return '';
  
  const sanitized = sanitizeText(notes);
  
  if (sanitized.length > 2000) {
    throw new Error('Notes must be less than 2000 characters');
  }
  
  return sanitized;
};

/**
 * Validate species selection
 */
export const validateSpecies = (species) => {
  const allowedSpecies = [
    'Portulacaria Afra',
    'Portulacaria Afra Variegata',
    'Other'
  ];
  
  if (!allowedSpecies.includes(species)) {
    throw new Error('Invalid species selection');
  }
  
  return species;
};

/**
 * Validate price input
 */
export const validatePrice = (price) => {
  if (!price && price !== 0) return null;
  
  const numPrice = parseFloat(price);
  
  if (isNaN(numPrice)) {
    throw new Error('Price must be a valid number');
  }
  
  if (numPrice < 0) {
    throw new Error('Price cannot be negative');
  }
  
  if (numPrice > 999999) {
    throw new Error('Price seems unreasonably high');
  }
  
  // Round to 2 decimal places
  return Math.round(numPrice * 100) / 100;
};

/**
 * Validate date input
 */
export const validateDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  
  // Check if date is not in the future
  if (date > now) {
    throw new Error('Date cannot be in the future');
  }
  
  // Check if date is not too far in the past (100 years)
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
  
  if (date < hundredYearsAgo) {
    throw new Error('Date cannot be more than 100 years ago');
  }
  
  return dateString;
};

/**
 * Validate activity type
 */
export const validateActivityType = (activityType) => {
  const allowedTypes = [
    'watering',
    'fertilizing',
    'pest-control',
    'repotting',
    'structural-work'
  ];
  
  if (!allowedTypes.includes(activityType)) {
    throw new Error('Invalid activity type');
  }
  
  return activityType;
};

/**
 * Validate and sanitize photo data
 */
export const validatePhotoData = (photoData) => {
  if (!photoData.url) {
    throw new Error('Photo URL is required');
  }
  
  // Support both storage URLs and legacy base64 data
  if (photoData.url.startsWith('https://')) {
    // Storage URL - basic validation
    if (!photoData.url.includes('supabase.co/storage')) {
      throw new Error('Invalid storage URL');
    }
  } else if (photoData.url.startsWith('data:image/')) {
    // Legacy base64 data - detailed validation
    if (!photoData.url.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)) {
      throw new Error('Invalid photo format. Only JPEG, PNG, GIF, and WebP images are allowed');
    }
    
    // Check file size for base64 data
    const base64Data = photoData.url.split(',')[1];
    const sizeInBytes = (base64Data.length * 3) / 4;
    const maxSizeInMB = 10;
    
    if (sizeInBytes > maxSizeInMB * 1024 * 1024) {
      throw new Error(`Photo size must be less than ${maxSizeInMB}MB`);
    }
  } else {
    throw new Error('Invalid photo URL format');
  }
  
  return {
    url: photoData.url,
    caption: validateNotes(photoData.caption || ''),
    file_name: sanitizeText(photoData.file_name || 'photo.jpg'),
    storage_path: photoData.storage_path || null
  };
};

/**
 * Rate limiting helper - simple client-side protection
 */
class RateLimiter {
  constructor() {
    this.attempts = new Map();
  }
  
  checkLimit(operation, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    const key = operation;
    
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }
    
    const attempts = this.attempts.get(key);
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    this.attempts.set(key, recentAttempts);
    
    if (recentAttempts.length >= maxAttempts) {
      throw new Error(`Too many attempts. Please wait before trying again.`);
    }
    
    // Record this attempt
    recentAttempts.push(now);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Comprehensive validation for plant data
 */
export const validatePlantData = (plantData) => {
  rateLimiter.checkLimit('plant-operation', 10, 60000); // 10 operations per minute
  
  return {
    name: validatePlantName(plantData.name),
    species: validateSpecies(plantData.species),
    acquisition_date: validateDate(plantData.acquisition_date),
    source: validateNotes(plantData.source),
    price: validatePrice(plantData.price),
    notes: validateNotes(plantData.notes)
  };
};

/**
 * Comprehensive validation for care activity data
 */
export const validateCareActivityData = (activityData) => {
  rateLimiter.checkLimit('care-activity', 20, 60000); // 20 activities per minute
  
  return {
    plant_id: activityData.plant_id, // UUID validation would be ideal but complex
    user_id: activityData.user_id,
    plant_name: validatePlantName(activityData.plant_name),
    activity_type: validateActivityType(activityData.activity_type),
    notes: validateNotes(activityData.notes || '')
  };
};