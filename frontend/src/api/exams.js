import { api } from "./client";
export const examsApi = {
  list: () => api.get("/admin/exams"),
  create: (payload) => api.post("/admin/exams", payload),
  publishResults: (id) => api.put(`/admin/exams/${id}/publish-results`),
  updateStatus: (id, status) => api.put(`/admin/exams/${id}/status`, { status }),
  delete: (id) => api.delete(`/admin/exams/${id}`),
};
