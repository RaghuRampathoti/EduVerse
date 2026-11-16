import { api } from "./client";

export const attendanceApi = {
  markFaculty: (payload) => api.post("/admin/attendance/faculty", payload),
  markFacultyBatch: (payload) => api.post("/admin/attendance/faculty/batch", payload),
  listFacultyAttendance: (date, params) => api.get("/admin/attendance/faculty", { params: { date, ...params } }),
  markStudent: (payload) => api.post("/admin/attendance/students", payload),
  listStudentAttendance: (classSectionId, date, params) => api.get("/admin/attendance/students", { params: { classSectionId, date, ...params } }),
};
