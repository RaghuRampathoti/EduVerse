import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  UserSquare2,
  CalendarCheck,
  Wallet,
  Megaphone,
  ShieldCheck,
  Settings,
  Baby,
  UserCircle,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  FileEdit,
  Layers,
  Folder,
  Award,
  CheckSquare,
  TrendingUp,
  MessageSquare,
  CalendarOff,
  Sparkles,
  BarChart2,
  CreditCard,
  Repeat,
  FileSpreadsheet,
  SlidersHorizontal,
  Activity,
  ShieldAlert,
  Headphones,
  Server,
  Bus,
  BookMarked,
  Info,
} from "lucide-react";

export const NAV_BY_ROLE = {
  MASTER_ADMIN: [
    { label: "Dashboard", to: "/master/dashboard", icon: LayoutDashboard },
    { label: "Organizations", to: "/master/organizations", icon: Building2 },
    { label: "Super Admins", to: "/master/super-admins", icon: ShieldCheck },
    { label: "Subscription Plans", to: "/master/subscription-plans", icon: CreditCard },
    { label: "Subscription Lifecycle", to: "/master/lifecycle", icon: Repeat },
    { label: "Billing & Reports", to: "/master/billing", icon: FileSpreadsheet },
    { label: "Feature Entitlements", to: "/master/entitlements", icon: SlidersHorizontal },
    { label: "Support Controls", to: "/master/support", icon: Headphones },
  ],
  SUPER_ADMIN: [
    {
      section: "DASHBOARD",
      items: [
        { label: "Dashboard", to: "/super-admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      section: "INSTITUTION MANAGEMENT",
      items: [
        { label: "Institutions", to: "/super-admin/institutions", icon: Building2 },
        { label: "Institution Details", to: "/super-admin/institutions-details", icon: Info },
        { label: "Admins", to: "/super-admin/admins", icon: ShieldCheck },
        { label: "Institution Status", to: "/super-admin/institutions-status", icon: Activity },
      ],
    },
    {
      section: "MONITORING",
      items: [
        { label: "Students", to: "/super-admin/students", icon: Users },
        { label: "Faculty", to: "/super-admin/faculty", icon: UserSquare2 },
        { label: "Classes & Sections", to: "/super-admin/classes", icon: GraduationCap },
        { label: "Timetable", to: "/super-admin/timetable", icon: Calendar },
        { label: "Fees & Payments", to: "/super-admin/fees", icon: Wallet },
        { label: "Institution Reports", to: "/super-admin/reports", icon: BarChart2 },
      ],
    },
    {
      section: "COMMUNICATION",
      items: [
        { label: "Announcements", to: "/super-admin/announcements", icon: Megaphone },
      ],
    },
    {
      section: "ADMINISTRATION",
      items: [
        { label: "Admin Activity", to: "/super-admin/activity", icon: Activity },
        { label: "Subscriptions & Limits", to: "/super-admin/subscription", icon: CreditCard },
        { label: "Settings", to: "/super-admin/settings", icon: Settings },
      ],
    },
  ],
  ADMIN: [
    {
      section: "ADMIN DASHBOARD",
      items: [
        { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      section: "INITIAL SETUP",
      items: [
        { label: "Academic Setup", to: "/admin/academic-setup", icon: GraduationCap },
        { label: "Staff Setup", to: "/admin/staff-setup", icon: UserSquare2 },
        { label: "Class Setup", to: "/admin/class-setup", icon: Building2 },
        { label: "Subject Setup", to: "/admin/subject-setup", icon: BookOpen },
        { label: "Section Setup", to: "/admin/section-setup", icon: Layers },
      ],
    },
    {
      section: "OPERATIONS",
      items: [
        { label: "Students", to: "/admin/students", icon: Users },
        { label: "Attendance", to: "/admin/attendance", icon: CalendarCheck },
        { label: "Fees", to: "/admin/fees", icon: Wallet },
        { label: "Exams", to: "/admin/exams", icon: Award },
        { label: "Homework", to: "/admin/homework", icon: FileEdit },
        { label: "Leave", to: "/admin/leave", icon: CalendarOff },
        { label: "Communication", to: "/admin/communication", icon: MessageSquare },
      ],
    },
    {
      section: "REPORTING DATA",
      items: [
        { label: "Reports & Monitoring", to: "/admin/reports", icon: BarChart2 },
      ],
    },
  ],
  FACULTY: [
    {
      section: "1. DASHBOARD & TODAY'S INFO",
      items: [
        { label: "Teacher Dashboard", to: "/faculty/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      section: "2. CLASSES & TIMETABLE",
      items: [
        { label: "My Classes", to: "/faculty/classes", icon: GraduationCap, badge: 6 },
        { label: "Class Timetable", to: "/faculty/timetable", icon: Calendar },
        { label: "My Subjects", to: "/faculty/subjects", icon: BookOpen },
      ],
    },
    {
      section: "3. ATTENDANCE",
      items: [
        { label: "Take Attendance", to: "/faculty/attendance", icon: ClipboardCheck },
        { label: "My Attendance", to: "/faculty/my-attendance", icon: CalendarCheck },
      ],
    },
    {
      section: "4. TEACH THE CLASS",
      items: [
        { label: "Lesson Plans", to: "/faculty/lesson-plans", icon: Layers },
        { label: "Study Materials", to: "/faculty/study-materials", icon: Folder },
      ],
    },
    {
      section: "5. ASSIGNMENTS & HOMEWORK",
      items: [
        { label: "Assignments", to: "/faculty/assignments", icon: FileText, badge: 12 },
        { label: "Homework", to: "/faculty/homework", icon: FileEdit },
      ],
    },
    {
      section: "6. MANAGE STUDENTS",
      items: [
        { label: "Students", to: "/faculty/students", icon: Users },
      ],
    },
    {
      section: "7. EXAMS & PERFORMANCE",
      items: [
        { label: "Examinations", to: "/faculty/examinations", icon: Award },
        { label: "Marks & Grading", to: "/faculty/marks-grading", icon: CheckSquare },
        { label: "Performance Analytics", to: "/faculty/analytics", icon: TrendingUp },
      ],
    },
    {
      section: "8. COMMUNICATION",
      items: [
        { label: "Messages", to: "/faculty/messages", icon: MessageSquare, badge: 4 },
        { label: "Announcements", to: "/faculty/announcements", icon: Megaphone },
      ],
    },
    {
      section: "9. UTILITIES & ACCOUNT",
      items: [
        { label: "Leave Management", to: "/faculty/leave", icon: CalendarOff },
        { label: "Calendar", to: "/faculty/calendar", icon: Calendar },
        { label: "Reports", to: "/faculty/reports", icon: BarChart2 },
        { label: "My Profile", to: "/faculty/profile", icon: UserCircle },
        { label: "Settings", to: "/faculty/settings", icon: Settings },
      ],
    },
  ],
  STUDENT: [
    { label: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Attendance", to: "/student/attendance", icon: CalendarCheck },
    { label: "My Fees", to: "/student/fees", icon: Wallet },
    { label: "Announcements", to: "/student/announcements", icon: Megaphone },
  ],
  PARENT: [
    { label: "Dashboard", to: "/parent/dashboard", icon: LayoutDashboard },
    { label: "My Children", to: "/parent/children", icon: Baby },
    { label: "Announcements", to: "/parent/announcements", icon: Megaphone },
  ],
};

export const ROLE_LABELS = {
  MASTER_ADMIN: "Master Admin",
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  FACULTY: "Faculty",
  STUDENT: "Student",
  PARENT: "Parent",
};

export const ROLE_HOME = {
  MASTER_ADMIN: "/master/dashboard",
  SUPER_ADMIN: "/super-admin/dashboard",
  ADMIN: "/admin/dashboard",
  FACULTY: "/faculty/dashboard",
  STUDENT: "/student/dashboard",
  PARENT: "/parent/dashboard",
};
