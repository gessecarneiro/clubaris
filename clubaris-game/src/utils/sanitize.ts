/**
 * Utility functions for input sanitization and security
 */

// Basic HTML tag strip and trim for text inputs to prevent simple XSS
export function sanitizeText(input: string): string {
  if (!input) return "";
  return input.replace(/<\/?[^>]+(>|$)/g, "").trim();
}

// Ensures only numeric characters are kept and restricts to min/max
export function sanitizeNumber(input: string, min: number = 0, max: number = 99999999999): number {
  const parsed = parseInt(input.toString().replace(/\D/g, ""), 10);
  if (isNaN(parsed)) return min;
  return Math.min(Math.max(parsed, min), max);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
