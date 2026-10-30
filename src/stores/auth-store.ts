import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Role } from "@/types";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  points: number;
  phone?: string;
  memberSince?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (email: string, role?: Role, name?: string, points?: number, phone?: string) => void;
  setUser: (user: UserSession | null) => void;
  syncFromDatabase: (emailOverride?: string) => Promise<UserSession | null>;
  logout: () => void;
  updatePoints: (delta: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Start as Guest (unauthenticated) by default
      user: null,
      isAuthenticated: false,

      login: (email: string, role: Role = "CUSTOMER", name?: string, points?: number, phone?: string) => {
        const isAdmin = email.includes("admin") || role === "ADMIN";
        const userName =
          name ||
          (isAdmin ? "Administrator JejakHijau" : email.split("@")[0].replace(".", " "));

        const newUser: UserSession = {
          id: `usr-${Date.now()}`,
          name: userName.charAt(0).toUpperCase() + userName.slice(1),
          email,
          role: isAdmin ? "ADMIN" : "CUSTOMER",
          points: points !== undefined ? points : isAdmin ? 9999 : 100,
          phone: phone || "",
          memberSince: "Oktober 2026",
        };

        set({
          user: newUser,
          isAuthenticated: true,
        });
      },

      setUser: (user: UserSession | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      syncFromDatabase: async (emailOverride?: string) => {
        const targetEmail = emailOverride || get().user?.email;
        if (!targetEmail) return null;

        try {
          const res = await fetch(`/api/account?email=${encodeURIComponent(targetEmail)}`);
          if (res.ok) {
            const data = await res.json();
            const syncedUser: UserSession = {
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role as Role,
              points: data.points,
              phone: data.phone,
              memberSince: data.memberSince,
            };
            set({
              user: syncedUser,
              isAuthenticated: true,
            });
            return syncedUser;
          }
          if (res.status === 404) {
            return null;
          }
        } catch (e) {
          console.warn("Failed to sync user from database:", e);
        }
        return null;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      updatePoints: (delta: number) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({
          user: {
            ...currentUser,
            points: Math.max(0, currentUser.points + delta),
          },
        });
      },
    }),
    {
      name: "jejakhijau-auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.email === "alim.pratama.work@gmail.com") {
          state.logout();
        }
      },
    }
  )
);
