import { api } from "./client";

export const studentApi = {
  list: (params) => api.get("/admin/students", { params }),
  get: (id) => api.get(`/admin/students/${id}`),
  create: (payload) => api.post("/admin/students", payload),
  update: (id, payload) => api.put(`/admin/students/${id}`, payload),
  delete: (id) => api.delete(`/admin/students/${id}`),

  // Self-service
  me: () => api.get("/student/me"),
  myAttendance: () => api.get("/student/attendance"),
  myAttendanceSummary: () => api.get("/student/attendance/summary"),
  myFees: () => api.get("/student/fees"),
};
