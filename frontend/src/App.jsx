import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

import Login from "@/pages/auth/Login";
import ChangePassword from "@/pages/auth/ChangePassword";

import MasterDashboard from "@/pages/master/MasterDashboard";
import InstitutionsPage from "@/pages/master/InstitutionsPage";
import SuperAdminsPage from "@/pages/master/SuperAdminsPage";
import SubscriptionPlansPage from "@/pages/master/SubscriptionPlansPage";
import SubscriptionLifecyclePage from "@/pages/master/SubscriptionLifecyclePage";
import BillingReportsPage from "@/pages/master/BillingReportsPage";
import FeatureEntitlementPage from "@/pages/master/FeatureEntitlementPage";
import SupportControlsPage from "@/pages/master/SupportControlsPage";

import SuperAdminDashboard from "@/pages/superadmin/SuperAdminDashboard";
import SuperAdminInstitutionsPage from "@/pages/superadmin/SuperAdminInstitutionsPage";
import SuperAdminInstitutionDetailsPage from "@/pages/superadmin/SuperAdminInstitutionDetailsPage";
import SuperAdminInstitutionStatusPage from "@/pages/superadmin/SuperAdminInstitutionStatusPage";
import AdminsPage from "@/pages/superadmin/AdminsPage";
import SuperAdminSubscriptionPage from "@/pages/superadmin/SuperAdminSubscriptionPage";
import SuperAdminReportsPage from "@/pages/superadmin/SuperAdminReportsPage";
import SuperAdminActivityPage from "@/pages/superadmin/SuperAdminActivityPage";
import SettingsPage from "@/pages/superadmin/SettingsPage";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminAcademicSetupPage from "@/pages/admin/AdminAcademicSetupPage";
import AdminStaffSetupPage from "@/pages/admin/AdminStaffSetupPage";
import AdminClassSetupPage from "@/pages/admin/AdminClassSetupPage";
import AdminSubjectSetupPage from "@/pages/admin/AdminSubjectSetupPage";
import AdminSectionSetupPage from "@/pages/admin/AdminSectionSetupPage";
import AdminAttendancePage from "@/pages/admin/AdminAttendancePage";
import AdminExamsPage from "@/pages/admin/AdminExamsPage";
import AdminHomeworkPage from "@/pages/admin/AdminHomeworkPage";
import AdminLeavePage from "@/pages/admin/AdminLeavePage";
import AdminCommunicationPage from "@/pages/admin/AdminCommunicationPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";

import ClassesPage from "@/pages/shared/ClassesPage";
import TimetablePage from "@/pages/shared/TimetablePage";
import StudentsPage from "@/pages/shared/StudentsPage";
import FacultyPage from "@/pages/shared/FacultyPage";
import FeesPage from "@/pages/shared/FeesPage";
import AnnouncementsPage from "@/pages/shared/AnnouncementsPage";

import FacultyDashboard from "@/pages/faculty/FacultyDashboard";
import MarkAttendancePage from "@/pages/faculty/MarkAttendancePage";
import MyAttendancePage from "@/pages/faculty/MyAttendancePage";
import FacultyProfilePage from "@/pages/faculty/FacultyProfilePage";
import FacultySubjectsPage from "@/pages/faculty/FacultySubjectsPage";
import FacultyTimetablePage from "@/pages/faculty/FacultyTimetablePage";
import FacultyAssignmentsPage from "@/pages/faculty/FacultyAssignmentsPage";
import FacultyHomeworkPage from "@/pages/faculty/FacultyHomeworkPage";
import FacultyLessonPlansPage from "@/pages/faculty/FacultyLessonPlansPage";
import FacultyStudyMaterialsPage from "@/pages/faculty/FacultyStudyMaterialsPage";
import FacultyExaminationsPage from "@/pages/faculty/FacultyExaminationsPage";
import FacultyMarksGradingPage from "@/pages/faculty/FacultyMarksGradingPage";
import FacultyAnalyticsPage from "@/pages/faculty/FacultyAnalyticsPage";
import FacultyMessagesPage from "@/pages/faculty/FacultyMessagesPage";
import FacultyLeaveManagementPage from "@/pages/faculty/FacultyLeaveManagementPage";
import FacultyCalendarPage from "@/pages/faculty/FacultyCalendarPage";
import FacultyReportsPage from "@/pages/faculty/FacultyReportsPage";
import FacultySettingsPage from "@/pages/faculty/FacultySettingsPage";

import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentAttendancePage from "@/pages/student/StudentAttendancePage";
import StudentFeesPage from "@/pages/student/StudentFeesPage";

import ParentDashboard from "@/pages/parent/ParentDashboard";
import ChildrenPage from "@/pages/parent/ChildrenPage";

import NotFound from "@/pages/NotFound";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Master Admin */}
      <Route
        path="/master"
        element={
          <ProtectedRoute roles={["MASTER_ADMIN"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MasterDashboard />} />
        <Route path="institutions" element={<InstitutionsPage />} />
        <Route path="organizations" element={<InstitutionsPage />} />
        <Route path="super-admins" element={<SuperAdminsPage />} />
        <Route path="subscription-plans" element={<SubscriptionPlansPage />} />
        <Route path="lifecycle" element={<SubscriptionLifecyclePage />} />
        <Route path="billing" element={<BillingReportsPage />} />
        <Route path="entitlements" element={<FeatureEntitlementPage />} />
        <Route path="support" element={<SupportControlsPage />} />
      </Route>

      {/* Super Admin */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute roles={["SUPER_ADMIN"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="institutions" element={<SuperAdminInstitutionsPage />} />
        <Route path="institutions-details" element={<SuperAdminInstitutionDetailsPage />} />
        <Route path="admins" element={<AdminsPage />} />
        <Route path="institutions-status" element={<SuperAdminInstitutionStatusPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="faculty" element={<FacultyPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="fees" element={<FeesPage />} />
        <Route path="reports" element={<SuperAdminReportsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="activity" element={<SuperAdminActivityPage />} />
        <Route path="subscription" element={<SuperAdminSubscriptionPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Initial Setup */}
        <Route path="academic-setup" element={<AdminAcademicSetupPage />} />
        <Route path="staff-setup" element={<AdminStaffSetupPage />} />
        <Route path="class-setup" element={<AdminClassSetupPage />} />
        <Route path="subject-setup" element={<AdminSubjectSetupPage />} />
        <Route path="section-setup" element={<AdminSectionSetupPage />} />

        {/* Operations */}
        <Route path="students" element={<StudentsPage />} />
        <Route path="attendance" element={<AdminAttendancePage />} />
        <Route path="fees" element={<FeesPage />} />
        <Route path="exams" element={<AdminExamsPage />} />
        <Route path="homework" element={<AdminHomeworkPage />} />
        <Route path="leave" element={<AdminLeavePage />} />
        <Route path="communication" element={<AdminCommunicationPage />} />

        {/* Reporting Data */}
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* Faculty */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute roles={["FACULTY"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="profile" element={<FacultyProfilePage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="subjects" element={<FacultySubjectsPage />} />
        <Route path="timetable" element={<TimetablePage />} />
        <Route path="attendance" element={<MarkAttendancePage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="assignments" element={<FacultyAssignmentsPage />} />
        <Route path="homework" element={<FacultyHomeworkPage />} />
        <Route path="lesson-plans" element={<FacultyLessonPlansPage />} />
        <Route path="study-materials" element={<FacultyStudyMaterialsPage />} />
        <Route path="examinations" element={<FacultyExaminationsPage />} />
        <Route path="marks-grading" element={<FacultyMarksGradingPage />} />
        <Route path="analytics" element={<FacultyAnalyticsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="messages" element={<FacultyMessagesPage />} />
        <Route path="leave" element={<FacultyLeaveManagementPage />} />
        <Route path="calendar" element={<FacultyCalendarPage />} />
        <Route path="reports" element={<FacultyReportsPage />} />
        <Route path="settings" element={<FacultySettingsPage />} />
        <Route path="my-attendance" element={<MyAttendancePage />} />
      </Route>

      {/* Student */}
      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["STUDENT"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="attendance" element={<StudentAttendancePage />} />
        <Route path="fees" element={<StudentFeesPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Route>

      {/* Parent */}
      <Route
        path="/parent"
        element={
          <ProtectedRoute roles={["PARENT"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="children" element={<ChildrenPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
