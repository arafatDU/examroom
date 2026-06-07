import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GraduationCap, BookOpen, ShieldCheck, Sparkles, ArrowRight, Users, Award, Clock } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) {
    const role = session.user.role;
    if (role === "ADMIN") redirect("/admin");
    if (role === "TEACHER") redirect("/teacher");
    if (role === "STUDENT") redirect("/student");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">ExamRoom</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">How It Works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors">Sign In</Link>
            <Link href="/register" className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow: "0 4px 14px rgba(99,102,241,.35)" }}>Get Started</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36" style={{ background: "linear-gradient(135deg,#eef2ff 0%,#ede9fe 45%,#fce7f3 100%)" }}>
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#a5b4fc,transparent)" }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#c4b5fd,transparent)" }} />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-indigo-100 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-700 mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              AI-Powered MCQ Platform for HSC Students
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Ace Your Exams with{" "}
              <span style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed,#9333ea)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>ExamRoom</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
              Take timed MCQ exams, get instant results with AI-powered justifications, and prepare for your boards — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all w-full sm:w-auto justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow: "0 8px 24px rgba(99,102,241,.4)" }}>
                Start for Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 bg-white text-slate-700 font-semibold text-base px-8 py-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all w-full sm:w-auto justify-center shadow-sm">
                Sign In
              </Link>
            </div>
            {/* Floating preview card */}
            <div className="mt-16 max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl p-5 text-left animate-float" style={{ boxShadow: "0 20px 60px rgba(99,102,241,.15)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Exam</p>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">HSC Physics — Chapter 5</h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-mono font-bold text-sm">
                    <Clock className="w-3.5 h-3.5" /> 14:32
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border-2 border-indigo-500 bg-indigo-50">
                    <span className="text-xs font-bold text-indigo-600 mr-2">A</span>
                    <span className="text-sm text-indigo-900 font-medium">Newton&apos;s First Law of Motion</span>
                  </div>
                  {["B", "C", "D"].map(opt => (
                    <div key={opt} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <span className="text-xs font-bold text-slate-400 mr-2">{opt}</span>
                      <span className="text-sm text-slate-400">Sample option {opt}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                  <span>Q 8 of 20</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-2/5 rounded-full" style={{ background: "linear-gradient(90deg,#6366f1,#7c3aed)" }} />
                  </div>
                  <span>40%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-14 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { value: "10,000+", label: "Students Enrolled", color: "#6366f1" },
                { value: "500+", label: "Teachers & Rooms", color: "#7c3aed" },
                { value: "98%", label: "Satisfaction Rate", color: "#9333ea" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <span className="text-4xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
                  <span className="text-sm text-slate-500 font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 md:py-28" style={{ background: "#f8f9ff" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <span className="badge badge-primary mb-4 inline-flex">Features</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Everything you need to excel</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">Built for HSC students and teachers who want a seamless, powerful exam experience.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Sparkles, title: "AI Question Extraction", desc: "Teachers upload images — our AI instantly extracts MCQs with options and justifications.", color: "#6366f1", bg: "#eef2ff" },
                { icon: Clock, title: "Real-Time Timed Exams", desc: "Live countdown timer with auto-submit. Tamper-proof exam engine keeps results fair.", color: "#7c3aed", bg: "#f5f3ff" },
                { icon: ShieldCheck, title: "Secure Instant Results", desc: "Get your score the moment you submit, with AI-generated justifications for every answer.", color: "#059669", bg: "#ecfdf5" },
                { icon: Users, title: "Exam Rooms", desc: "Join private or public rooms. Teachers manage students, approve requests, and schedule exams.", color: "#2563eb", bg: "#eff6ff" },
                { icon: Award, title: "Performance Tracking", desc: "Review your complete exam history, scores, accuracy trends, and detailed question breakdowns.", color: "#d97706", bg: "#fffbeb" },
                { icon: GraduationCap, title: "Board Exam Ready", desc: "Content aligned with HSC syllabus. Practice exactly what matters for your final exams.", color: "#9333ea", bg: "#faf5ff" },
              ].map((f) => (
                <div key={f.title} className="er-card p-6 bg-white">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: f.bg }}>
                    <f.icon className="w-6 h-6" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <span className="badge badge-primary mb-4 inline-flex">Process</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">How ExamRoom works</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">Get started in minutes — no complicated setup required.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "01", title: "Create Account", desc: "Register as a student or teacher in under a minute." },
                { step: "02", title: "Join a Room", desc: "Students join rooms via code or browse public listings." },
                { step: "03", title: "Exam & Results", desc: "Take timed MCQ exams and instantly get AI-justified results." },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow: "0 8px 24px rgba(99,102,241,.3)" }}>
                    <span className="text-2xl font-extrabold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed,#9333ea)" }}>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Ready to start your journey?</h2>
            <p className="text-indigo-200 text-lg mb-10 max-w-xl mx-auto">Join thousands of HSC students who are already using ExamRoom to prepare smarter.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold text-base px-10 py-4 rounded-2xl hover:bg-indigo-50 transition-all shadow-lg w-full sm:w-auto justify-center">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 text-white font-semibold text-base px-10 py-4 rounded-2xl border-2 border-white/30 hover:border-white/60 transition-all w-full sm:w-auto justify-center">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">ExamRoom</span>
            </div>
            <p className="text-sm text-slate-500">© 2026 ExamRoom. All rights reserved.</p>
            <nav className="flex gap-6">
              <Link href="#" className="text-sm hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="text-sm hover:text-white transition-colors">Privacy</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
