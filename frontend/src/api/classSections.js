import { api } from "./client";

export const classSectionApi = {
  list: () => api.get("/admin/class-sections"),
  create: (payload) => api.post("/admin/class-sections", payload),
  update: (id, payload) => api.put(`/admin/class-sections/${id}`, payload),
  delete: (id) => api.delete(`/admin/class-sections/${id}`),
};
