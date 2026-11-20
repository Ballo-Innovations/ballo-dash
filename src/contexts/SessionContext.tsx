import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/** The signed-in user as returned by the API's GET /api/auth/me. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
}

type Status = "loading" | "authenticated" | "unauthenticated";

interface SessionValue {
  /** Same shape NextAuth's useSession returned, so existing components keep working. */
  data: { user: SessionUser } | null;
  status: Status;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (!response.ok) throw new Error(String(response.status));
      const body = (await response.json()) as { user: SessionUser };
      setUser(body.user);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
    // Full load so every cached page and client state is dropped.
    window.location.assign("/login");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<SessionValue>(
    () => ({ data: user ? { user } : null, status, refresh, signOut }),
    [user, status, refresh, signOut]
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}
