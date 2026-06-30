import { useEffect, useState } from "react";
import { api, clearToken } from "../lib/api";
import { useNavigate } from "react-router-dom";



import {
  HiSparkles,
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlineFire,
  HiCheckCircle,
  HiOutlineBookOpen,
} from "react-icons/hi";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  branch?: string;
  year?: string;
  stats?: { tasksCompleted: number; notesCreated: number; aiChats: number };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Task {
  id: number;
  title: string;
  due: string;
  done: boolean;
}


interface Activity {
  id: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  text: string;
  time: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const USER_FALLBACK = {
  name: "Student",
  branch: "Not set",
  year: "Not set",
  streak: 7,
  tasksCompleted: 0,
  notesCreated: 0,
  aiChats: 0,
};

const TASKS: Task[] = [
  { id: 1, title: "Submit OS Assignment",      due: "Today, 11:59 PM", done: false },
  { id: 2, title: "DBMS Lab Report",           due: "Tomorrow, 9 AM",  done: false },
  { id: 3, title: "DSA Practice — Trees",      due: "Wed, 6 PM",       done: false },
  { id: 4, title: "CN Module 3 Notes",         due: "Thu, 5 PM",       done: true },
];


const ACTIVITIES: Activity[] = [
  { id: 1, icon: HiOutlineDocumentText, iconColor: "text-[#6C63FF]", iconBg: "bg-[#6C63FF]/12", text: "Added notes for Data Structures",     time: "2 min ago"  },
  { id: 2, icon: HiSparkles,            iconColor: "text-amber-400", iconBg: "bg-amber-400/10", text: "AI summarised OS Module 4",            time: "1 hr ago"   },
  { id: 3, icon: HiCheckCircle,         iconColor: "text-green-400", iconBg: "bg-green-400/10", text: "Marked CN Notes as complete",          time: "3 hrs ago"  },
  { id: 4, icon: HiOutlineClipboardList,iconColor: "text-sky-400",   iconBg: "bg-sky-400/10",   text: "Created assignment: DBMS Lab Report",  time: "Yesterday"  },
];



// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** True if an error message looks like an auth failure (expired/invalid/missing token). */
function isAuthError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("token") || m.includes("authorization") || m.includes("unauthorized") || m.includes("401");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-widest">{title}</h2>
      {action && (
        <button
          type="button"
          className="flex items-center gap-0.5 text-xs text-[#6C63FF] hover:text-[#A5A0FF] transition-colors focus-visible:outline-none focus-visible:underline"
        >
          {action} <HiOutlineChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function QuickActionCard({
  icon: Icon,
  label,
  sub,
  accent,
  glow,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  accent: string;
  glow: string;
}) {
  return (
    <button
      type="button"
      className="group relative flex flex-col items-start gap-3 rounded-2xl border border-white/[0.07] bg-[#111118] p-4 text-left shadow-lg transition-all hover:border-white/[0.12] hover:bg-[#16161F] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] overflow-hidden"
    >
      {/* Hover glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: glow }}
      />
      <span
        className="relative flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: accent + "18" }}
      >
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </span>
      <div className="relative">
        <p className="text-sm font-semibold text-[#E2E8F0] leading-tight">{label}</p>
        <p className="text-xs text-[#4B5563] mt-0.5">{sub}</p>
      </div>
    </button>
  );
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: number) => void }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/[0.05] last:border-0">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? "Mark incomplete" : "Mark complete"}
        className="mt-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] rounded-full"
      >
        {task.done ? (
          <HiCheckCircle className="w-5 h-5 text-[#6C63FF]" />
        ) : (
          <HiOutlineCheckCircle className="w-5 h-5 text-[#3B4558] hover:text-[#6C63FF] transition-colors" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${task.done ? "line-through text-[#3B4558]" : "text-[#E2E8F0]"}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {!task.done && (
            <>
              <span className="text-[#2D3748]">·</span>
              <span className="flex items-center gap-1 text-xs text-[#4B5563]">
                <HiOutlineClock className="w-3 h-3" /> {task.due}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState(USER_FALLBACK);

  useEffect(() => {
    let mounted = true;
    (async () => { 
      // 1) Load profile (name) so header reflects backend auth.
      try {
        const p = await api.auth.profile();
        if (mounted) {
          setProfile(p.user);
          setStats(prev => ({
            ...prev,
            ...(p.user.stats ?? {}),
          }));
        }
      } catch (e: any) {
        // If token is invalid, existing tasks call will surface 401 and handle redirect.
      }
    
      try {
        setLoading(true);
        setError(null);
        const res = await api.tasks.list();
        const mapped: Task[] = res.tasks.map((t: any) => ({
          id: Number(t.id),
          title: String(t.title),
          due: String(t.dueDate ?? t.due_date ?? ''),
          done: Boolean(t.completed),
        }));

        if (mounted) setTasks(mapped);
      } catch (e: any) {
        if (!mounted) return;
        setError(String(e?.message ?? e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleTask = async (id: number) => {
    const current = tasks.find((t) => t.id === id);
    const nextCompleted = !current?.done;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: nextCompleted } : t)));

    try {
      await api.tasks.update(id, { completed: nextCompleted });
    } catch (e: any) {
      // revert on failure
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !nextCompleted } : t)));
      if (String(e?.message ?? '').toLowerCase().includes('token') || String(e?.message ?? '').includes('Authorization')) {
        clearToken();
        navigate('/', { replace: true });
      }
    }
  };

  const pendingCount = tasks.filter((t) => !t.done).length;

  return (

<div className="relative min-h-screen bg-[#0A0A0F] px-4 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))] overflow-x-hidden">

      {/* Ambient orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-100px] left-1/2 -translate-x-1/2 w-[480px] h-[340px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.16) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto max-w-sm space-y-5">

        {/* ── 1. Welcome card ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] px-5 py-5 shadow-xl overflow-hidden relative">
          {/* Inner accent line */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(108,99,255,0.5), transparent)" }}
          />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#4B5563] font-medium mb-1">{getGreeting()} 👋</p>
              <h1
                className="text-xl font-bold text-white leading-tight"
                style={{ letterSpacing: "-0.03em" }}
              >
                {(profile?.name ?? USER_FALLBACK.name).split(" ")[0]},
              </h1>
              <p className="text-sm text-[#64748B] mt-0.5">Ready to crush today?</p>
            </div>

            {/* Avatar + streak */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center ring-2 ring-[#6C63FF]/30 ring-offset-2 ring-offset-[#111118]">
                <span className="text-base font-bold text-white">{getInitials(profile?.name ?? USER_FALLBACK.name)}</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-400">
                <HiOutlineFire className="w-3 h-3" /> {USER_FALLBACK.streak}d
              </span>
            </div>
          </div>

          {/* Mini stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { value: stats.tasksCompleted, label: "Tasks done" },
              { value: stats.notesCreated,   label: "Notes" },
              { value: stats.aiChats,        label: "AI chats" },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="rounded-xl bg-white/[0.04] border border-white/[0.05] py-2 text-center"
              >
                <p className="text-base font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
                  {value}
                </p>
                <p className="text-[10px] text-[#4B5563] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Student card ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] px-5 py-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineBookOpen className="w-4 h-4 text-[#6C63FF]" />
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Student</p>
          </div>
          <div className="space-y-2">
            {[
              { Icon: HiOutlineLightningBolt, label: "Name",   value: profile?.name ?? USER_FALLBACK.name },
              { Icon: HiOutlineAcademicCap,   label: "Branch", value: profile?.branch ?? USER_FALLBACK.branch },
              { Icon: HiOutlineCalendar,      label: "Year",   value: profile?.year ?? USER_FALLBACK.year },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.05] px-3 py-2.5">
                <Icon className="w-4 h-4 text-[#6C63FF] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-[#4B5563] uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-[#E2E8F0] font-medium truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. Quick actions ────────────────────────────────────────────── */}
        <div>
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon={HiOutlineDocumentText}
              label="Notes"
              sub={`${stats.notesCreated} notes saved`}
              accent="#6C63FF"
              glow="radial-gradient(ellipse at top left, rgba(108,99,255,0.12), transparent 70%)"
            />
            <QuickActionCard
              icon={HiOutlineClipboardList}
              label="Assignments"
              sub={`${pendingCount} pending`}
              accent="#F59E0B"
              glow="radial-gradient(ellipse at top left, rgba(245,158,11,0.10), transparent 70%)"
            />
            <div className="col-span-2">
              <QuickActionCard
                icon={HiSparkles}
                label="AI Assistant"
                sub="Ask anything — summaries, explanations, quizzes"
                accent="#A78BFA"
                glow="radial-gradient(ellipse at top left, rgba(167,139,250,0.12), transparent 70%)"
              />
            </div>
          </div>
        </div>

        {/* ── 4. Recent activity ──────────────────────────────────────────── */}
        <div>
          <SectionHeader title="Recent Activity" action="See all" />
          <div className="rounded-2xl border border-white/[0.07] bg-[#111118] divide-y divide-white/[0.05] shadow-xl overflow-hidden">
            {ACTIVITIES.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                <span className={`mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-xl ${a.iconBg}`}>
                  <a.icon className={`w-4 h-4 ${a.iconColor}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#C4CDD8] leading-snug">{a.text}</p>
                  <p className="text-xs text-[#3B4558] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. Upcoming tasks ───────────────────────────────────────────── */}
        <div>
          <SectionHeader title="Upcoming Tasks" action="Add task" />
          <div className="rounded-2xl border border-white/[0.07] bg-[#111118] px-4 shadow-xl">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} />
            ))}
          </div>
          {pendingCount === 0 && (
            <p className="mt-3 text-center text-xs text-green-400 font-medium">
              🎉 All tasks done!
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
