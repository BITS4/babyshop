import { vi } from "vitest"

export function createMockFirebaseUser(
  overrides: Partial<{ uid: string; email: string; photoURL: string | null }> = {}
) {
  return {
    uid: overrides.uid ?? "test-user",
    email: overrides.email ?? "parent@example.com",
    photoURL: overrides.photoURL ?? null,
    getIdToken: vi.fn().mockResolvedValue("test-firebase-token"),
  }
}

export function createFirestoreProfile(data: Record<string, unknown> = {}) {
  return {
    exists: vi.fn(() => true),
    data: vi.fn(() => data),
  }
}
