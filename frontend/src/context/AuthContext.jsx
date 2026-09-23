import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/auth";
import { extractErrorMessage } from "../api/client";

const AuthContext = createContext(null);

export function resolveUserWithAssignedBranch(userData) {
  if (!userData) return null;
  const email = userData.email ? userData.email.toLowerCase().trim() : "";
  const userId = userData.id ? String(userData.id) : "";

  let assignedType = null;
  let assignedName = null;

  // 1. Direct explicit key in localStorage
  if (email) {
    assignedType = localStorage.getItem(`eduverse_admin_assigned_type_${email}`);
    assignedName = localStorage.getItem(`eduverse_admin_assigned_name_${email}`);
  }

  // 2. Search all superadmin institution lists in localStorage (e.g. eduverse_superadmin_institutions_*)
  if (!assignedType) {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("eduverse_superadmin_institutions") || key.includes("institutions"))) {
          const raw = localStorage.getItem(key);
          if (raw && (raw.startsWith("[") || raw.startsWith("{"))) {
            const parsed = JSON.parse(raw);
            const list = Array.isArray(parsed) ? parsed : (parsed.institutions || []);
            const match = list.find((item) => {
              const itemEmail = item.adminEmail ? item.adminEmail.toLowerCase().trim() : "";
              const itemAdminId = item.adminId ? String(item.adminId) : "";
              return (email && itemEmail === email) || (userId && itemAdminId === userId);
            });
            if (match) {
              if (match.type) assignedType = match.type;
              if (match.name) assignedName = match.name;
              break;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed scanning superadmin institutions for assigned admin type:", e);
    }
  }

  const finalType = assignedType || userData.assignedInstitutionType || userData.institutionType || userData.institution?.type || "SCHOOL";
  const finalName = assignedName || userData.institutionName || userData.institution?.name;

  return {
    ...userData,
    assignedInstitutionType: finalType,
    institutionType: finalType,
    ...(finalName ? { institutionName: finalName } : {}),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("eduverse_user");
    return stored ? resolveUserWithAssignedBranch(JSON.parse(stored)) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("eduverse_access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ data }) => {
        const enriched = resolveUserWithAssignedBranch(data.data);
        setUser(enriched);
        localStorage.setItem("eduverse_user", JSON.stringify(enriched));
      })
      .catch(() => {
        localStorage.removeItem("eduverse_access_token");
        localStorage.removeItem("eduverse_refresh_token");
        localStorage.removeItem("eduverse_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const { data } = await authApi.login(username, password);
      const { accessToken, refreshToken, user: loggedInUser } = data.data;
      const enriched = resolveUserWithAssignedBranch(loggedInUser);
      localStorage.setItem("eduverse_access_token", accessToken);
      localStorage.setItem("eduverse_refresh_token", refreshToken);
      localStorage.setItem("eduverse_user", JSON.stringify(enriched));
      setUser(enriched);
      return { success: true, user: enriched };
    } catch (error) {
      return { success: false, message: extractErrorMessage(error) };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("eduverse_access_token");
    localStorage.removeItem("eduverse_refresh_token");
    localStorage.removeItem("eduverse_user");
    setUser(null);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const { data } = await authApi.me();
    const enriched = resolveUserWithAssignedBranch(data.data);
    setUser(enriched);
    localStorage.setItem("eduverse_user", JSON.stringify(enriched));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
