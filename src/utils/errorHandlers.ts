/**
 * Format API error messages
 */
export const formatApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
};

/**
 * Create a toast notification for errors
 */
export const notifyError = (error: unknown): void => {
  const message = formatApiError(error);
  console.error(message);
  // Here you would typically call a toast notification library
  // For example: toast.error(message);
};

/**
 * Handle API errors with a callback
 */
export const handleApiError = (error: unknown, callback?: (message: string) => void): void => {
  const message = formatApiError(error);
  
  if (callback) {
    callback(message);
  } else {
    notifyError(message);
  }
};