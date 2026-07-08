import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineBell, HiSparkles, HiOutlineDocumentText, HiOutlineClipboardList, HiOutlineTrash } from "react-icons/hi";
import { api, ApiRequestError, type NotificationItem, type NotificationType } from "../lib/api";
import { formatRelativeTime } from "../lib/formatRelativeTime";
import { SkeletonRow } from "./components/Skeleton";

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  task: HiOutlineClipboardList,
  note: HiOutlineDocumentText,
  ai: HiSparkles,
  general: HiOutlineBell,
};

const TYPE_STYLE: Record<NotificationType, { bg: string; color: string }> = {
  task: { bg: "bg-[#F59E0B]/12", color: "text-[#F59E0B]" },
  note: { bg: "bg-[#6C63FF]/12", color: "text-[#6C63FF]" },
  ai: { bg: "bg-[#A78BFA]/12", color: "text-[#A78BFA]" },
  general: { bg: "bg-sky-400/10", color: "text-sky-400" },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.notifications.list(100);
        if (mounted) setItems(res.notifications);
      } catch (e: unknown) {
        if (!mounted) return;
        // A 401 means api.ts already cleared the token and the global
        // AuthEventHandler is already redirecting to Login.
        if (e instanceof ApiRequestError && e.status === 401) return;
        setError(e instanceof Error ? e.message : "Couldn’t load notifications. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = async (id: number) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.notifications.markRead(id);
    } catch (e: unknown) {
      if (e instanceof ApiRequestError && e.status === 401) return;
      // Revert on failure so the UI doesn't lie about state.
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    const previous = items;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.notifications.markAllRead();
    } catch (e: unknown) {
      if (!(e instanceof ApiRequestError && e.status === 401)) {
        setItems(previous);
      }
    } finally {
      setMarkingAll(false);
    }
  };

  const removeNotification = async (id: number) => {
    const previous = items;
    setItems((prev) => prev.filter((n) => n.id !== id));
    try {
      await api.notifications.delete(id);
    } catch (e: unknown) {
      if (!(e instanceof ApiRequestError && e.status === 401)) {
        setItems(previous);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] px-4 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))] overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-100px] left-1/2 -translate-x-1/2 w-[480px] h-[340px] rounded-full"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.16) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto max-w-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>
              Notifications
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[#E2E8F0] hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
          >
            <HiOutlineArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            disabled={markingAll}
            className="w-full rounded-xl border border-[#6C63FF]/20 bg-[#6C63FF]/10 py-2.5 text-sm font-semibold text-[#A5A0FF] transition-colors hover:bg-[#6C63FF]/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
          >
            {markingAll ? "Marking all read…" : "Mark all as read"}
          </button>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/[0.07] bg-[#111118] divide-y divide-white/[0.05] shadow-xl overflow-hidden">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-6 text-center shadow-xl">
            <p className="text-sm font-semibold text-red-200">Something went wrong</p>
            <p className="mt-1 text-xs text-red-200/80">{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.07] bg-[#111118] p-6 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6C63FF]/12 ring-1 ring-[#6C63FF]/20">
              <HiOutlineBell className="w-5 h-5 text-[#6C63FF]" />
            </div>
            <p className="mt-4 text-sm font-semibold text-white">No notifications yet</p>
            <p className="mt-2 text-xs text-[#64748B]">
              Things like completed tasks and new notes will show up here.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-[#111118] divide-y divide-white/[0.05] shadow-xl overflow-hidden">
            {items.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? HiOutlineBell;
              const style = TYPE_STYLE[n.type] ?? TYPE_STYLE.general;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${!n.read ? "bg-[#6C63FF]/[0.04]" : ""}`}
                >
                  <span className={`mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-xl ${style.bg}`}>
                    <Icon className={`w-4 h-4 ${style.color}`} />
                  </span>
                  <button
                    type="button"
                    onClick={() => !n.read && markRead(n.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <p className="text-sm text-[#C4CDD8] leading-snug">{n.title}</p>
                    {n.message && <p className="mt-0.5 text-xs text-[#64748B] leading-snug">{n.message}</p>}
                    <p className="text-xs text-[#3B4558] mt-1">{formatRelativeTime(n.createdAt)}</p>
                  </button>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {!n.read && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#6C63FF]" aria-hidden="true" />}
                    <button
                      type="button"
                      onClick={() => removeNotification(n.id)}
                      aria-label="Delete notification"
                      className="text-[#4B5563] hover:text-red-400 transition-colors"
                    >
                      <HiOutlineTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
