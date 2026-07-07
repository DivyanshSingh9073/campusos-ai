import { useNavigate } from "react-router-dom";
import { HiOutlineClipboardList, HiOutlineArrowLeft } from "react-icons/hi";

// Placeholder for the Tasks page.
//
// The backend already has full CRUD for tasks (see Backend/src/routes/tasks.routes.ts
// and lib/api.ts's `api.tasks.*`), but there has never been a dedicated Tasks
// page in the frontend — task management currently only lives inline on the
// Dashboard. This page exists so Dashboard's "Assignments" card and "Add task"
// link have a real, working destination instead of doing nothing. Building
// out full task creation/editing here is separate, future work.
export default function TasksPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] px-4 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))] overflow-x-hidden">
      {/* Ambient orb — same treatment as Notes/Dashboard */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-110px] left-1/2 -translate-x-1/2 w-[480px] h-[340px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.14) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto max-w-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
              Assignments
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">Tasks &amp; assignments, all in one place.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[#E2E8F0] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
          >
            <HiOutlineArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-6 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F59E0B]/12 ring-1 ring-[#F59E0B]/20">
            <HiOutlineClipboardList className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <p className="mt-4 text-sm font-semibold text-white">🚧 Coming Soon</p>
          <p className="mt-2 text-xs text-[#64748B]">
            A dedicated Assignments page is on its way. In the meantime, you can view and check off
            your upcoming tasks right from the Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
