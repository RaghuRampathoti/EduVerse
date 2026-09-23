import { api } from "./client";
export const homeworkApi = {
  list: () => api.get("/admin/homework"),
  create: (payload) => api.post("/admin/homework", payload),
  delete: (id) => api.delete(`/admin/homework/${id}`),
};
