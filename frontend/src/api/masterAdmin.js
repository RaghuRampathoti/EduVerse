import { api } from "./client";

export const masterAdminApi = {
  createInstitution: (payload) => api.post("/master/institutions", payload),
  listInstitutions: () => api.get("/master/institutions"),
  getInstitution: (id) => api.get(`/master/institutions/${id}`),
  updateInstitution: (id, payload) => api.put(`/master/institutions/${id}`, payload),
  deleteInstitution: (id) => api.delete(`/master/institutions/${id}`),
  resetSuperAdminPassword: (id) => api.post(`/master/institutions/${id}/reset-super-admin-password`),
  listSuperAdmins: () => api.get("/master/super-admins"),
  deleteSuperAdmin: (id) => api.delete(`/master/super-admins/${id}`),
  dashboard: () => api.get("/master/dashboard"),

  // Additional Master Admin endpoints
  getSubscriptionPlans: () => api.get("/master/subscription-plans"),
  createSubscriptionPlan: (payload) => api.post("/master/subscription-plans", payload),
  getSubscriptionLifecycle: () => api.get("/master/subscriptions/lifecycle"),
  updateSubscriptionLifecycle: (id, payload) => api.put(`/master/subscriptions/lifecycle/${id}`, payload),
  getBillingReports: () => api.get("/master/billing/reports"),
  getFeatureEntitlements: () => api.get("/master/entitlements"),
  updateFeatureEntitlement: (id, payload) => api.put(`/master/entitlements/${id}`, payload),
  getPlatformReports: () => api.get("/master/reports"),
  getAuditLogs: () => api.get("/master/audit-logs"),
  getSupportNotices: () => api.get("/master/support/notices"),
  createSupportNotice: (payload) => api.post("/master/support/notices", payload),
  getSystemConfig: () => api.get("/master/system-config"),
  updateSystemConfig: (payload) => api.put("/master/system-config", payload),
};
