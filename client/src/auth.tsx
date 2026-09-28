import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, type User } from "./api";

const Ctx = createContext<{ user: User | null; logout: () => void }>({
  user: null,
  logout() {},
});
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch(() => setUser(null));
  }, []);
  const logout = () =>
    api("/auth/logout", { method: "POST" }).then(() => setUser(null));
  return <Ctx.Provider value={{ user, logout }}>{children}</Ctx.Provider>;
}
