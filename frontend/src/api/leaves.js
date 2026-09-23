import { api } from "./client";
export const leavesApi = {
  list: () => api.get("/admin/leaves"),
  pending: () => api.get("/admin/leaves/pending"),
  apply: (payload) => api.post("/admin/leaves", payload),
  decide: (id, status) => api.put(`/admin/leaves/${id}/decision`, { status }),
};
