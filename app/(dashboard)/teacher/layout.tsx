"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Home, PlusCircle, FileText, LogOut, BookOpen, Menu, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const sidebarItems = [
  { name: "My ExamRooms", href: "/teacher", icon: Home },
  { name: "Create Room", href: "/teacher/rooms/new", icon: PlusCircle },
  { name: "AI Question Extraction", href: "/teacher/extract", icon: Sparkles },
  { name: "Global Question Bank", href: "/admin/questions", icon: FileText },
  { name: "Add Question Manually", href: "/teacher/questions/new", icon: PlusCircle },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userName = session?.user?.name || "Teacher";
  const userEmail = session?.user?.email || "";
  const initials = userName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
              isActive
                ? "text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
            style={isActive ? { background: "linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow: "0 4px 12px rgba(99,102,241,.3)" } : {}}
          >
            <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-slate-400")} />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f8f9ff" }}>
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/teacher" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 block leading-none">ExamRoom</span>
              <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">Teacher Portal</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLinks />
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ──────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl animate-scale-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold text-slate-900">ExamRoom</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-5 space-y-1">
              <NavLinks onClick={() => setMobileOpen(false)} />
            </nav>
            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                  <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                </div>
              </div>
              <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main area ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900">ExamRoom</span>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="page-enter">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden flex border-t border-slate-200 bg-white flex-shrink-0">
          {sidebarItems.slice(0, 3).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors",
                  isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
