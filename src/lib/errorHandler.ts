/**
 * Error handler utility to map database errors to user-friendly messages
 * while logging technical details for debugging
 */

export const getUserFriendlyError = (error: any): string => {
  // Log technical error for debugging (server-side only in production)
  if (import.meta.env.DEV) {
    console.error('Database error:', error);
  }
  
  // Map common Postgres error codes
  if (error.code === '23505') {
    return 'This record already exists';
  }
  if (error.code === '42501') {
    return 'You do not have permission to perform this action';
  }
  if (error.code === '23503') {
    return 'Referenced record not found';
  }
  if (error.code === '23514') {
    return 'Invalid data provided';
  }
  
  // Auth-specific errors (keep user-friendly)
  if (error.message?.includes('User already registered')) {
    return 'An account with this email already exists';
  }
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (error.message?.includes('Email not confirmed')) {
    return 'Please confirm your email address';
  }
  if (error.message?.includes('Password should be at least')) {
    return 'Password must be at least 6 characters';
  }
  
  // Generic fallback
  return 'An error occurred. Please try again or contact support.';
};

