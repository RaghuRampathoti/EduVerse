import React from "react";
import { NavLink } from "react-router-dom";
import { GraduationCap, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_BY_ROLE, ROLE_LABELS } from "./nav-data";
import { useAuth } from "@/context/AuthContext";

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
  const items = NAV_BY_ROLE[user?.role] || [];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <GraduationCap className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none">EduVerse</p>
              <p className="text-[11px] text-sidebar-foreground/60 mt-0.5">{ROLE_LABELS[user?.role]}</p>
            </div>
          </div>
          <button className="lg:hidden text-sidebar-foreground/70" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {items.map((item, idx) => {
            if (item.section) {
              return (
                <div key={item.section || idx} className="space-y-1">
                  <p className="px-3 text-[10px] font-bold text-sidebar-foreground/50 tracking-wider uppercase mb-1.5">
                    {item.section}
                  </p>
                  <div className="space-y-1">
                    {item.items.map((subItem) => (
                      <NavLink
                        key={subItem.to}
                        to={subItem.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                              : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )
                        }
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <subItem.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{subItem.label}</span>
                        </div>
                        {subItem.badge !== undefined && (
                          <span className="ml-2 shrink-0 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-sidebar-primary/20 text-sidebar-primary text-[11px] font-bold">
                            {subItem.badge}
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="ml-2 shrink-0 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-sidebar-primary/20 text-sidebar-primary text-[11px] font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {user?.institutionName && (
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.institutionName}</p>
          )}
        </div>
      </aside>
    </>
  );
}
