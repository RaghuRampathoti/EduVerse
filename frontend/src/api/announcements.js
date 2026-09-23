import { api } from "./client";

export const announcementApi = {
  list: (params) => api.get("/announcements", { params }),
  create: (payload) => api.post("/announcements", payload),
  delete: (id) => api.delete(`/announcements/${id}`),
};
