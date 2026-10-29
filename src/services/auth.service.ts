/**
 * Mock authentication service.
 *
 * Everything here is demonstration behaviour only: no real credentials are
 * transmitted, no account is created anywhere, and the "session" lives in
 * browser memory/localStorage. Milestone 2 replaces this with real
 * Supabase auth while keeping the same interface.
 */
import { seedUser } from "@/data/mock/seed";
import type { UserProfile } from "@/types/domain";
import { mockDelay, nowIso } from "./mock";

export interface AuthSession {
  user: UserProfile | null;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthService {
  getSession(): Promise<AuthSession>;
  signIn(input: SignInInput): Promise<UserProfile>;
  signUp(input: SignUpInput): Promise<UserProfile>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<{ sent: boolean }>;
  resetPassword(token: string, newPassword: string): Promise<{ ok: boolean }>;
  updateProfile(input: { name: string; email: string }): Promise<UserProfile>;
  subscribe(listener: () => void): () => void;
  getSnapshot(): AuthSession;
}

const STORAGE_KEY = "pm_mock_session_v1";

let session: AuthSession = { user: null };
const listeners = new Set<() => void>();

function readStored(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) session = JSON.parse(raw) as AuthSession;
  } catch {
    session = { user: null };
  }
}

function persist(): void {
  if (typeof window === "undefined") return;
  if (session.user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  else window.localStorage.removeItem(STORAGE_KEY);
}

function setSession(next: AuthSession): void {
  session = next;
  persist();
  listeners.forEach((l) => l());
}

export const authService: AuthService = {
  async getSession() {
    readStored();
    return mockDelay(session, 60);
  },
  async signIn({ email, password }) {
    await mockDelay(null, 450);
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    const user: UserProfile = {
      ...seedUser,
      email,
      name: email.split("@")[0] ? email.split("@")[0].replace(/[._]/g, " ") : "Viewer",
    };
    setSession({ user });
    return user;
  },
  async signUp({ name, email, password }) {
    await mockDelay(null, 500);
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    const user: UserProfile = { ...seedUser, id: `usr-${nowIso()}`, name, email, joinedAt: nowIso(), coinBalance: 30 };
    setSession({ user });
    return user;
  },
  async signOut() {
    await mockDelay(null, 150);
    setSession({ user: null });
  },
  async requestPasswordReset() {
    await mockDelay(null, 400);
    return { sent: true };
  },
  async resetPassword() {
    await mockDelay(null, 450);
    return { ok: true };
  },
  async updateProfile(input) {
    await mockDelay(null, 300);
    if (!session.user) throw new Error("Not signed in.");
    const user = { ...session.user, ...input };
    setSession({ user });
    return user;
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return session;
  },
};

readStored();
