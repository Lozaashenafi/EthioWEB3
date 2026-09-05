/**
 * Lightweight input validation helpers for Express route handlers.
 * Returns an error message string if invalid, or null if valid.
 */

export function requireFields(body: Record<string, unknown>, ...fields: string[]): string | null {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== 'string' || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Invalid email format';
  }
  if (email.trim().length > 255) {
    return 'Email is too long (max 255 characters)';
  }
  return null;
}

export function validateName(name: unknown): string | null {
  if (typeof name !== 'string' || !name.trim()) {
    return 'Name is required';
  }
  if (name.trim().length > 100) {
    return 'Name is too long (max 100 characters)';
  }
  return null;
}

export function validateUsername(username: unknown): string | null {
  if (typeof username !== 'string' || !username.trim()) {
    return 'Username is required';
  }
  const cleaned = username.replace('@', '').trim();
  if (cleaned.length < 2 || cleaned.length > 30) {
    return 'Username must be 2-30 characters';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(cleaned)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
}

export function validateUrl(url: unknown, fieldName = 'URL'): string | null {
  if (typeof url !== 'string' || !url.trim()) {
    return `${fieldName} is required`;
  }
  try {
    new URL(url.trim());
  } catch {
    return `Invalid ${fieldName} format`;
  }
  return null;
}

export function validateStatus(status: unknown, allowedStatuses: string[]): string | null {
  if (typeof status !== 'string' || !status.trim()) {
    return 'Status is required';
  }
  if (!allowedStatuses.includes(status.trim())) {
    return `Invalid status. Allowed: ${allowedStatuses.join(', ')}`;
  }
  return null;
}

export function validateSlug(slug: unknown): string | null {
  if (typeof slug !== 'string' || !slug.trim()) {
    return 'Slug is required';
  }
  if (slug.trim().length > 200) {
    return 'Slug is too long (max 200 characters)';
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
    return 'Slug must contain only lowercase letters, numbers, and hyphens';
  }
  return null;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string') {
    return null; // Password is optional in many flows
  }
  if (password.length > 0 && password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  if (password.length > 128) {
    return 'Password is too long (max 128 characters)';
  }
  return null;
}

/** Trim and limit string length, returning undefined if input is falsy */
export function sanitizeString(value: unknown, maxLength = 5000): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}
