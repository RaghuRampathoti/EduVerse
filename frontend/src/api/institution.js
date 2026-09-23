import { api } from "./client";

export const institutionApi = {
  getMine: () => api.get("/institution/me"),
  updateMine: (payload) => api.put("/institution/me", payload),
  createAdmin: (payload) => api.post("/institution/admins", payload),
  listAdmins: () => api.get("/institution/admins"),
  updateAdminStatus: (adminId, status) => api.put(`/institution/admins/${adminId}/status`, { status }),
  deleteAdmin: (adminId) => api.delete(`/institution/admins/${adminId}`),
  resetAdminPassword: (adminId) => api.post(`/institution/admins/${adminId}/reset-password`),
  getActivityLogs: (page = 0, size = 200) => api.get(`/institution/activity-logs?page=${page}&size=${size}`),
};
