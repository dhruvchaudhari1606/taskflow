import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/common";

export const CURRENT_USER_QUERY_KEY = ["currentUser"];

export function useCurrentUser() {
  const { user: storedUser, setUser } = useAuthStore();

  const query = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const data = await authApi.getProfile();
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      const profile = query.data;
      const resolvedName =
        profile.name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        profile.firstName ||
        profile.email?.split("@")[0] ||
        "";

      const normalizedUser: User = {
        id: profile.id || storedUser?.id || "user-id",
        name: resolvedName,
        email: profile.email || storedUser?.email || "",
        avatarUrl: profile.avatar_url || profile.avatarUrl || storedUser?.avatarUrl || null,
        createdAt: profile.created_at || profile.createdAt,
        updatedAt: profile.updated_at || profile.updatedAt,
      };

      if (
        !storedUser ||
        storedUser.name !== normalizedUser.name ||
        storedUser.email !== normalizedUser.email ||
        storedUser.avatarUrl !== normalizedUser.avatarUrl ||
        storedUser.id !== normalizedUser.id
      ) {
        setUser(normalizedUser);
      }
    }
  }, [query.data, setUser, storedUser]);

  // Memoized so consumers get a stable reference between renders
  const activeUser: User | null = useMemo(
    () =>
      query.data
        ? {
            id: query.data.id || storedUser?.id || "user-id",
            name:
              query.data.name ||
              [query.data.first_name, query.data.last_name].filter(Boolean).join(" ") ||
              query.data.firstName ||
              query.data.email?.split("@")[0] ||
              "",
            email: query.data.email || storedUser?.email || "",
            avatarUrl: query.data.avatar_url || query.data.avatarUrl || storedUser?.avatarUrl || null,
            createdAt: query.data.created_at || query.data.createdAt,
            updatedAt: query.data.updated_at || query.data.updatedAt,
          }
        : storedUser,
    [query.data, storedUser]
  );

  return {
    ...query,
    user: activeUser,
    setUser,
  };
}
