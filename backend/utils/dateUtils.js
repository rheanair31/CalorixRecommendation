/**
 * Date utility functions for Indian Standard Time (IST)
 * IST is UTC+5:30
 * 
 * This implementation uses direct UTC offset calculations for reliability
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

/**
 * Get current date/time in IST
 * @returns {Date} Current date in IST
 */
export const getISTDate = () => {
  const now = new Date();
  // Add IST offset to UTC time
  return new Date(now.getTime() + IST_OFFSET_MS);
};

/**
 * Convert any date to IST
 * @param {Date|string} date - Date to convert
 * @returns {Date} Date with IST offset applied
 */
export const toISTDate = (date) => {
  if (!date) return getISTDate();
  
  const inputDate = new Date(date);
  // Return date with IST offset
  return new Date(inputDate.getTime() + IST_OFFSET_MS);
};

/**
 * Get start of day in IST (00:00:00)
 * @param {Date|string} date - Optional date, defaults to today
 * @returns {Date} Start of day in IST as UTC Date object
 */
export const getISTStartOfDay = (date = null) => {
  let targetDate;
  
  if (date) {
    targetDate = new Date(date);
  } else {
    targetDate = new Date(); // Current UTC time
  }
  
  // Get the date components in IST
  const utcTime = targetDate.getTime();
  const istTime = new Date(utcTime + IST_OFFSET_MS);
  
  // Extract IST date parts
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const day = istTime.getUTCDate();
  
  // Create start of day in IST (midnight IST)
  const istStartOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  
  // Convert back to UTC for storage
  return new Date(istStartOfDay.getTime() - IST_OFFSET_MS);
};

/**
 * Get end of day in IST (23:59:59.999)
 * @param {Date|string} date - Optional date, defaults to today
 * @returns {Date} End of day in IST as UTC Date object
 */
export const getISTEndOfDay = (date = null) => {
  let targetDate;
  
  if (date) {
    targetDate = new Date(date);
  } else {
    targetDate = new Date(); // Current UTC time
  }
  
  // Get the date components in IST
  const utcTime = targetDate.getTime();
  const istTime = new Date(utcTime + IST_OFFSET_MS);
  
  // Extract IST date parts
  const year = istTime.getUTCFullYear();
  const month = istTime.getUTCMonth();
  const day = istTime.getUTCDate();
  
  // Create end of day in IST (11:59:59.999 PM IST)
  const istEndOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  
  // Convert back to UTC for storage
  return new Date(istEndOfDay.getTime() - IST_OFFSET_MS);
};

/**
 * Get date range for a specific number of days in IST
 * @param {number} days - Number of days to go back
 * @returns {Object} Object with startDate and endDate
 */
export const getISTDateRange = (days = 7) => {
  const endDate = getISTEndOfDay();
  
  const startDate = getISTStartOfDay();
  const startDateMs = startDate.getTime() - (days * 24 * 60 * 60 * 1000);
  
  return { 
    startDate: new Date(startDateMs), 
    endDate 
  };
};

/**
 * Format date for IST display (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string in IST
 */
export const formatISTDate = (date) => {
  const inputDate = new Date(date);
  
  // Add IST offset
  const istTime = new Date(inputDate.getTime() + IST_OFFSET_MS);
  
  // Get date components from UTC (which now represents IST)
  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istTime.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Check if a date is today in IST
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today in IST
 */
export const isToday = (date) => {
  const today = formatISTDate(new Date());
  const checkDate = formatISTDate(new Date(date));
  return today === checkDate;
};

/**
 * Get yesterday's date in IST
 * @returns {Date} Yesterday's date in IST
 */
export const getYesterdayIST = () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  return new Date(yesterday.getTime() + IST_OFFSET_MS);
};

/**
 * Debug: Log IST date information
 * @param {Date} date - Date to debug
 * @param {string} label - Label for the log
 */
export const debugISTDate = (date, label = 'Date') => {
  const d = new Date(date);
  const istDate = new Date(d.getTime() + IST_OFFSET_MS);
  
  console.log(`🕐 ${label}:`, {
    'Original UTC': d.toISOString(),
    'IST Time': istDate.toISOString(),
    'IST Date String': formatISTDate(d),
    'IST Year': istDate.getUTCFullYear(),
    'IST Month': istDate.getUTCMonth() + 1,
    'IST Day': istDate.getUTCDate(),
    'IST Hour': istDate.getUTCHours(),
    'IST Minute': istDate.getUTCMinutes()
  });
};
