import { api } from "./client";

export const attendanceApi = {
  markFaculty: (payload) => api.post("/admin/attendance/faculty", payload),
  listFacultyAttendance: (date, params) => api.get("/admin/attendance/faculty", { params: { date, ...params } }),
};
