/** Shared helpers for mock services. */

export function mockDelay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function mockFail<T>(message: string, ms = 220): Promise<T> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
}

export function nowIso(): string {
  return new Date().toISOString();
}
