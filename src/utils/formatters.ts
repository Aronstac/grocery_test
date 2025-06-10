/**
 * Format a date string to a localized date string
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format a date string to a localized date and time string
 */
export const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString();
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format a phone number
 */
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // For Ukrainian phone numbers (+380XXXXXXXXX)
  if (phone.startsWith('+380')) {
    return phone.replace(/(\+380)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return phone;
};

/**
 * Capitalize first letter of each word
 */
export const capitalize = (str: string): string => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format a status string (replace underscores with spaces and capitalize)
 */
export const formatStatus = (status: string): string => {
  return capitalize(status.replace(/_/g, ' '));
};