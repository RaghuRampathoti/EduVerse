import { api } from "./client";

export const timetableApi = {
  listByClass: (classSectionId) => api.get("/admin/timetable", { params: { classSectionId } }),
  saveEntry: (payload) => api.post("/admin/timetable", payload),
  deleteEntry: (id) => api.delete(`/admin/timetable/${id}`),
  assignFirstPeriod: (classSectionId) =>
    api.post("/admin/timetable/assign-first-period", null, { params: { classSectionId } }),
};
