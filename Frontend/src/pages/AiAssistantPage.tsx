import { useNavigate } from "react-router-dom";
import { HiSparkles, HiOutlineArrowLeft } from "react-icons/hi";

// Placeholder for the AI Assistant page.
//
// There is no AI/LLM integration anywhere in this project yet (no backend
// route, no OpenAI client, no chat UI) — this page exists purely so
// Dashboard's "AI Assistant" card has a real destination instead of a dead
// button. The actual assistant is separate, future work.
export default function AiAssistantPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] px-4 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))] overflow-x-hidden">
      {/* Ambient orb — same treatment as Notes/Dashboard */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-110px] left-1/2 -translate-x-1/2 w-[480px] h-[340px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.16) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto max-w-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
              AI Assistant
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">Your AI campus companion.</p>
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A78BFA]/12 ring-1 ring-[#A78BFA]/20">
            <HiSparkles className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <p className="mt-4 text-sm font-semibold text-white">🚧 Coming Soon</p>
          <p className="mt-2 text-xs text-[#64748B]">
            Your AI study assistant — summaries, explanations, and quizzes — is on its way.
          </p>
        </div>
      </div>
    </div>
  );
}
