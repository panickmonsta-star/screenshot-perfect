import { useSyncExternalStore } from "react";
import { authService, type AuthSession } from "@/services";

/**
 * Bridges the mock auth session into React. The service owns the store;
 * Milestone 2 swaps the service implementation and this hook keeps working.
 */
export function useMockSession(): AuthSession {
  return useSyncExternalStore(authService.subscribe, authService.getSnapshot, authService.getSnapshot);
}
