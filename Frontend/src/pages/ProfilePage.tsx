import { useEffect, useState } from "react";
import { api, clearToken, ApiRequestError } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { Toast } from "./components/Toast";

import {
  HiOutlineMail,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlinePencil,
  HiOutlineLogout,
  HiOutlineShieldCheck,
  HiOutlineBell,
  HiOutlineChevronRight,
  HiSparkles,
} from "react-icons/hi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: number;
  name: string;
  email: string;
  branch?: string;
  year?: string;
  stats?: { tasksCompleted: number; notesCreated: number; aiChats: number };
}

interface EffectiveUser {
  name: string;
  email: string;
  branch: string;
  year: string;
  avatar: string | null;
  joinedYear: string;
  tasksCompleted: number;
  notesCreated: number;
  aiChats: number;
}

// ─── Safe defaults ────────────────────────────────────────────────────────────
// Used until the real profile loads, and as fallbacks for fields the
// backend does not yet return (branch, year, stats, etc).

const DEFAULT_USER: EffectiveUser = {
  name: "Student",
  email: "",
  branch: "Not set",
  year: "Not set",
  avatar: null,
  joinedYear: "",
  tasksCompleted: 0,
  notesCreated: 0,
  aiChats: 0,
};
// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
        {value}
      </span>
      <span className="text-[10px] text-[#4B5563] font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ─── Settings row ─────────────────────────────────────────────────────────────

function SettingsRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] rounded-xl"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06]">
        <Icon className="w-4 h-4 text-[#94A3B8]" />
      </span>
      <span className="flex-1 text-sm text-[#C4CDD8]">{label}</span>
      <HiOutlineChevronRight className="w-4 h-4 text-[#3B4558]" />
    </button>
  );
}

// ─── Logout modal ─────────────────────────────────────────────────────────────

function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#16161F] p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-white mb-1">Log out?</h3>
        <p className="text-sm text-[#64748B] mb-6">
          You'll need to sign in again to access your CampusOS account.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500/90 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit profile modal ───────────────────────────────────────────────────────

function EditProfileModal({
  initialName,
  initialBranch,
  initialYear,
  onCancel,
  onSave,
}: {
  initialName: string;
  initialBranch: string;
  initialYear: string;
  onCancel: () => void;
  onSave: (values: { name: string; branch: string; year: string }) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [branch, setBranch] = useState(initialBranch === "Not set" ? "" : initialBranch);
  const [year, setYear] = useState(initialYear === "Not set" ? "" : initialYear);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required");
      return;
    }
    if (trimmed.length > 255) {
      setNameError("Name must be 255 characters or fewer");
      return;
    }
    setSaving(true);
    try {
      await onSave({ name: trimmed, branch: branch.trim(), year: year.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8 sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#16161F] p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-white mb-4">Edit profile</h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#94A3B8]">Name</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="Your name"
              className={`mt-1 w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#3B4558] outline-none transition-colors focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 ${
                nameError ? "border-red-500/60" : "border-white/10"
              }`}
            />
            {nameError && <p className="mt-1.5 text-xs text-red-400">{nameError}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#94A3B8]">Branch</label>
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g., Computer Science"
              maxLength={100}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#3B4558] outline-none transition-colors focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#94A3B8]">Year</label>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 3rd Year"
              maxLength={50}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#3B4558] outline-none transition-colors focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-white/10 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="flex-1 rounded-xl bg-[#6C63FF] py-2.5 text-sm font-semibold text-white hover:bg-[#7C6FFF] transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error" | "info"; text: string } | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handleSaveProfile = async (values: { name: string; branch: string; year: string }) => {
    try {
      const res = await api.auth.updateProfile(values);
      setProfile(res.user);
      setShowEditModal(false);
      setToast({ kind: "success", text: "Profile updated" });
    } catch (e: unknown) {
      if (e instanceof ApiRequestError && e.status === 401) return;
      setToast({ kind: "error", text: e instanceof Error ? e.message : "Couldn’t update profile" });
    }
  };

  const handleLogout = () => {
    setShowLogout(false);
    clearToken();
    setProfile(null);
    navigate("/", { replace: true });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.auth.profile();
        if (!mounted) return;
        setProfile(res.user);
      } catch (e: unknown) {
        // A 401 here means api.ts already cleared the token and emitted an
        // 'unauthorized' event — AuthEventHandler (mounted in App.tsx) is
        // already redirecting to Login. Skip setting a local error so the
        // page doesn't flash "Something went wrong" mid-redirect.
        if (e instanceof ApiRequestError && e.status === 401) {
          return;
        }

        const message = e instanceof Error ? e.message : "Unknown error";
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <p className="text-sm text-[#64748B]">Loading profile…</p>
      </div>
    );
  }

  // ── Logged out screen ──
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <HiOutlineLogout className="w-7 h-7 text-[#64748B]" />
          </div>
          <p className="text-white font-semibold text-lg mb-1">Something went wrong</p>
          <p className="text-sm text-[#4B5563]">Could not load your profile.</p>

        </div>
      </div>
    );
  }

  // Merge the safe defaults with whatever the backend actually returned.
  // branch/year are populated by the backend as of Phase 14; avatar and the
  // stats object are still not returned, so those continue to fall back to
  // DEFAULT_USER until a real endpoint exists for them.
  const effectiveUser: EffectiveUser = {
    name: profile?.name ?? DEFAULT_USER.name,
    email: profile?.email ?? DEFAULT_USER.email,
    branch: profile?.branch ?? DEFAULT_USER.branch,
    year: profile?.year ?? DEFAULT_USER.year,
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] px-4 py-10 pb-[calc(7rem+env(safe-area-inset-bottom))] overflow-x-hidden">


      {/* Ambient orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-80px] left-1/2 -translate-x-1/2 w-[420px] h-[320px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto max-w-sm space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
            Campus<span className="text-[#6C63FF]">OS</span>
          </h1>
          <span className="flex items-center gap-1.5 rounded-full border border-[#6C63FF]/30 bg-[#6C63FF]/10 px-3 py-1">
            <HiSparkles className="w-3.5 h-3.5 text-[#6C63FF]" />
            <span className="text-xs font-medium text-[#A5A0FF]">AI Plan</span>
          </span>
        </div>

        {/* ── Profile card ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] px-6 py-7 shadow-xl text-center">

          {/* Avatar */}
          <div className="relative inline-block mb-4">
            {effectiveUser.avatar ? (
              <img
                src={effectiveUser.avatar}
                alt={effectiveUser.name}
                className="w-20 h-20 rounded-full object-cover ring-2 ring-[#6C63FF]/40 ring-offset-2 ring-offset-[#111118]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#8B5CF6] flex items-center justify-center ring-2 ring-[#6C63FF]/40 ring-offset-2 ring-offset-[#111118]">
                <span className="text-xl font-bold text-white">{getInitials(effectiveUser.name)}</span>
              </div>
            )}
            {/* Online dot */}
            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[#111118]" />
          </div>

          {/* Name & Join Date */}
          <h2 className="text-xl font-bold text-white mb-0.5" style={{ letterSpacing: "-0.02em" }}>
            {effectiveUser.name}
          </h2>
          <p className="text-xs text-[#4B5563] mb-5">Joined {effectiveUser.joinedYear}</p>

          {/* Info pills */}
          <div className="space-y-2 text-left mb-6">
            {[
              { Icon: HiOutlineMail, value: effectiveUser.email },
              { Icon: HiOutlineAcademicCap, value: effectiveUser.branch },
              { Icon: HiOutlineCalendar, value: effectiveUser.year },
            ].map(({ Icon, value }) => (
              <div
                key={value || Math.random()}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5"
              >
                <Icon className="w-4 h-4 text-[#6C63FF] shrink-0" />
                <span className="text-sm text-[#C4CDD8] truncate">{value || "Not set"}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-[#E2E8F0] hover:bg-white/10 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
            >
              <HiOutlinePencil className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => setShowLogout(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <HiOutlineLogout className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* ── Stats card ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] px-6 py-5 shadow-xl">
          <p className="text-xs font-semibold text-[#4B5563] uppercase tracking-widest mb-4">Activity</p>
          <div className="flex items-center justify-around divide-x divide-white/[0.06]">
            <StatPill value={profile?.stats?.tasksCompleted ?? 0} label="Tasks" />
            <StatPill value={profile?.stats?.notesCreated ?? 0} label="Notes" />
            <StatPill value={profile?.stats?.aiChats ?? 0} label="AI Chats" />
          </div>
        </div>

        {/* ── Settings card ── */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] px-2 py-2 shadow-xl">
          <p className="text-xs font-semibold text-[#4B5563] uppercase tracking-widest px-4 pt-2 pb-1">Settings</p>
          <SettingsRow icon={HiOutlineBell} label="Notifications" onClick={() => navigate("/notifications")} />
          <SettingsRow
            icon={HiOutlineShieldCheck}
            label="Privacy & Security"
            onClick={() => setToast({ kind: "info", text: "Privacy & Security settings are coming soon" })}
          />
        </div>

      </div>

      {/* ── Logout modal ── */}
      {showLogout && (
        <LogoutModal
          onCancel={() => setShowLogout(false)}
          onConfirm={handleLogout}
        />
      )}

      {/* ── Edit profile modal ── */}
      {showEditModal && (
        <EditProfileModal
          initialName={effectiveUser.name}
          initialBranch={effectiveUser.branch}
          initialYear={effectiveUser.year}
          onCancel={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {toast && <Toast kind={toast.kind} text={toast.text} />}
    </div>
  );
}
