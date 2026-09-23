import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import {
  GraduationCap,
  Loader2,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  Building2,
  UserCheck,
  BookOpen,
  User,
  Users,
  KeyRound,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLE_HOME } from "@/components/layout/nav-data";

const DEMO_ACCOUNTS = [
  {
    role: "Master Admin",
    icon: ShieldAlert,
    color: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
    email: "masteradmin@eduverse.com",
    password: "MasterAdmin@123",
    desc: "Global System Admin"
  },
  {
    role: "Super Admin",
    icon: ShieldCheck,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20",
    email: "superadmin@eduverse.com",
    password: "SuperAdmin@123",
    desc: "Institution Super Admin"
  },
  {
    role: "Institution Admin",
    icon: Building2,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20",
    email: "admin@eduverse.com",
    password: "Admin@123",
    desc: "School Operations Admin"
  },
  {
    role: "Faculty",
    icon: BookOpen,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
    email: "faculty@eduverse.com",
    password: "Faculty@123",
    desc: "Teaching & Attendance"
  },
  {
    role: "Student",
    icon: User,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
    email: "student@eduverse.com",
    password: "Student@123",
    desc: "Courses, Fees & Attendance"
  },
  {
    role: "Parent",
    icon: Users,
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 hover:bg-cyan-500/20",
    email: "parent@eduverse.com",
    password: "Parent@123",
    desc: "Child Academic Portal"
  }
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showDemoPanel, setShowDemoPanel] = useState(true);

  if (user) {
    const dest = location.state?.from?.pathname || ROLE_HOME[user.role] || "/";
    return <Navigate to={dest} replace />;
  }

  function applyDemoAccount(acc) {
    setUsername(acc.email);
    setPassword(acc.password);
    setSelectedRole(acc.role);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    if (result.user.mustChangePassword) {
      navigate("/change-password", { replace: true });
      return;
    }
    navigate(ROLE_HOME[result.user.role] || "/", { replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-4 py-8 text-slate-100">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center mb-3">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">EduVerse</h1>
          <p className="text-sm text-slate-400 mt-1">Multi-Tenant Education Management Platform</p>
        </div>

        <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-white">Sign in to your account</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your login credentials or select a demo account below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-slate-200">Username or Email</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="name@organization.com"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSelectedRole(null);
                  }}
                  required
                  autoFocus
                  className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSelectedRole(null);
                    }}
                    required
                    className="pr-10 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-600/20" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Sign in
              </Button>
            </form>

            {/* Quick Demo Credentials Panel */}
            <div className="border-t border-slate-800 pt-4 mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Demo Logins & Credentials</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDemoPanel(!showDemoPanel)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                  {showDemoPanel ? (
                    <>Hide <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>Show <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
              </div>

              {showDemoPanel && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {DEMO_ACCOUNTS.map((acc) => {
                    const Icon = acc.icon;
                    const isSelected = selectedRole === acc.role;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => applyDemoAccount(acc)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all relative ${
                          isSelected
                            ? "bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-500/10"
                            : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <div className={`p-1.5 rounded-md border shrink-0 ${acc.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-100">{acc.role}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">Pass: {acc.password}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          Accounts are managed by organization administrators. Need help? Contact system support.
        </p>
      </div>
    </div>
  );
}

