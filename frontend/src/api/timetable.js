import { api } from "./client";

export const timetableApi = {
  // Admin & Super Admin APIs
  listByClass: (classSectionId) => api.get("/admin/timetable", { params: { classSectionId } }),
  saveEntry: (payload) => api.post("/admin/timetable", payload),
  deleteEntry: (id) => api.delete(`/admin/timetable/${id}`),
  assignFirstPeriod: (classSectionId) =>
    api.post("/admin/timetable/assign-first-period", null, { params: { classSectionId } }),

  // Faculty Read-Only APIs
  getMyTimetable: () => api.get("/faculty/timetable/me"),
  getClassTimetableForFaculty: (classSectionId) => api.get(`/faculty/timetable/class/${classSectionId}`),
};
