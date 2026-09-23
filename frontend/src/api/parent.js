import { api } from "./client";

export const parentApi = {
  children: () => api.get("/parent/children"),
  childAttendance: (studentId) => api.get(`/parent/children/${studentId}/attendance`),
  childAttendanceSummary: (studentId) => api.get(`/parent/children/${studentId}/attendance/summary`),
  childFees: (studentId) => api.get(`/parent/children/${studentId}/fees`),
};
