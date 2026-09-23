import { api } from "./client";

export const facultyApi = {
  list: (params) => api.get("/admin/faculty", { params }),
  get: (id) => api.get(`/admin/faculty/${id}`),
  create: (payload) => api.post("/admin/faculty", payload),
  update: (id, payload) => api.put(`/admin/faculty/${id}`, payload),
  delete: (id) => api.delete(`/admin/faculty/${id}`),

  // Self-service
  me: () => api.get("/faculty/me"),
  myStudents: (classSectionId, params) =>
    api.get("/faculty/students", { params: { classSectionId, ...params } }),
  markStudentAttendance: (payload) => api.post("/faculty/attendance/students", payload),
  classAttendance: (classSectionId, date, params) =>
    api.get("/faculty/attendance/students", { params: { classSectionId, ...(date ? { date } : {}), ...params } }),
  myAttendance: () => api.get("/faculty/attendance/me"),
  myAttendanceSummary: () => api.get("/faculty/attendance/me/summary"),
};
