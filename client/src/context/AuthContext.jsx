import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const AuthContext = createContext(null);
const LS_KEY = "td_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const persist = useCallback((u) => {
    if (u) localStorage.setItem(LS_KEY, JSON.stringify(u));
    else localStorage.removeItem(LS_KEY);
    setUser(u);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      const subRes = await fetch(
        `/api/subscriptions/${encodeURIComponent(data.user.email)}`
      );
      const subData = await subRes.json();

      const fullUser = {
        email: data.user.email,
        name: data.user.name,
        subscriptions: subData.subscriptions || [],
      };
      persist(fullUser);
      return fullUser;
    },
    [persist]
  );

  const signup = useCallback(
    async (name, email, password) => {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");

      const fullUser = {
        email: data.user.email,
        name: data.user.name,
        subscriptions: data.user.subscriptions || [],
      };
      persist(fullUser);
      return fullUser;
    },
    [persist]
  );

  const logout = useCallback(() => persist(null), [persist]);

  const value = useMemo(
    () => ({ user, setUser, login, signup, logout }),
    [user, setUser, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
