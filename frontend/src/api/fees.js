import { api } from "./client";

export const feeApi = {
  createStructure: (payload) => api.post("/admin/fees/structures", payload),
  listStructures: () => api.get("/admin/fees/structures"),
  deleteStructure: (id) => api.delete(`/admin/fees/structures/${id}`),
  recordPayment: (payload) => api.post("/admin/fees/payments", payload),
  listPayments: (params) => api.get("/admin/fees/payments", { params }),
  studentFees: (studentId) => api.get(`/admin/fees/students/${studentId}`),
  summary: () => api.get("/admin/fees/summary"),
};
