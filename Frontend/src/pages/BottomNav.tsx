import { useState } from "react";
import {
  HiHome,
  HiOutlineHome,
  HiDocumentText,
  HiOutlineDocumentText,
  HiClipboardList,
  HiOutlineClipboardList,
  HiSparkles,
  HiUser,
  HiOutlineUser,
} from "react-icons/hi";

// ─── Tab definition ───────────────────────────────────────────────────────────

type TabId = "home" | "notes" | "tasks" | "ai" | "profile";

interface Tab {
  id: TabId;
  label: string;
  Icon: React.ElementType;
  ActiveIcon: React.ElementType;
}

const TABS: Tab[] = [
  { id: "home",    label: "Home",    Icon: HiOutlineHome,          ActiveIcon: HiHome             },
  { id: "notes",   label: "Notes",   Icon: HiOutlineDocumentText,  ActiveIcon: HiDocumentText     },
  { id: "tasks",   label: "Tasks",   Icon: HiOutlineClipboardList, ActiveIcon: HiClipboardList    },
  { id: "ai",      label: "AI",      Icon: HiSparkles,             ActiveIcon: HiSparkles         },
  { id: "profile", label: "Profile", Icon: HiOutlineUser,          ActiveIcon: HiUser             },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function BottomNav() {
  const [active, setActive] = useState<TabId>("home");

  return (
    <>
      {/* ── Demo screen (so the nav has something to sit on) ── */}
      <div className="fixed inset-0 bg-[#0A0A0F] flex flex-col items-center justify-center select-none">
        {/* Ambient orb */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(108,99,255,0.14) 0%, transparent 70%)",
            filter: "blur(24px)",
          }}
        />
        <p
          className="text-3xl font-bold text-white mb-1"
          style={{ letterSpacing: "-0.04em" }}
        >
          Campus<span className="text-[#6C63FF]">OS</span>
        </p>
        <p className="text-sm text-[#4B5563]">
          Active:{" "}
          <span className="text-[#6C63FF] font-medium">
            {TABS.find((t) => t.id === active)?.label}
          </span>
        </p>
      </div>

      {/* ── Bottom Nav ── */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 inset-x-0 z-50"
      >
        {/* Frosted surface */}
        <div
          className="mx-auto max-w-lg rounded-t-[28px] border-t border-white/[0.07] px-2 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]"
          style={{
            background: "rgba(17, 17, 24, 0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <ul className="flex items-end justify-around">
            {TABS.map((tab) => {
              const isActive = active === tab.id;
              const isAI = tab.id === "ai";

              return (
                <li key={tab.id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => setActive(tab.id)}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={tab.label}
                    className={`
                      relative w-full flex flex-col items-center gap-1
                      focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-[#6C63FF] focus-visible:ring-offset-1
                      focus-visible:ring-offset-[#111118] rounded-xl
                      transition-all duration-200
                      ${isAI ? "-translate-y-3" : ""}
                    `}
                  >
                    {/* AI special pill  */}
                    {isAI ? (
                      <span
                        className={`
                          flex items-center justify-center w-14 h-14 rounded-2xl
                          transition-all duration-200
                          ${isActive
                            ? "bg-[#6C63FF] shadow-lg shadow-[#6C63FF]/40"
                            : "bg-[#1C1C2A] border border-white/10"
                          }
                        `}
                      >
                        <tab.ActiveIcon
                          className={`w-6 h-6 transition-colors duration-200 ${
                            isActive ? "text-white" : "text-[#4B5563]"
                          }`}
                        />
                        {/* Glow pulse when active */}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-2xl animate-ping"
                            style={{
                              background: "rgba(108,99,255,0.25)",
                              animationDuration: "2s",
                            }}
                          />
                        )}
                      </span>
                    ) : (
                      /* Regular tab */
                      <span
                        className={`
                          flex items-center justify-center w-10 h-10 rounded-xl
                          transition-all duration-200
                          ${isActive ? "bg-[#6C63FF]/12" : ""}
                        `}
                      >
                        {isActive ? (
                          <tab.ActiveIcon className="w-5 h-5 text-[#6C63FF]" />
                        ) : (
                          <tab.Icon className="w-5 h-5 text-[#4B5563]" />
                        )}
                      </span>
                    )}

                    {/* Label */}
                    <span
                      className={`
                        text-[10px] font-medium leading-none
                        transition-all duration-200
                        ${isAI
                          ? isActive ? "text-[#A5A0FF]" : "text-[#4B5563]"
                          : isActive ? "text-[#6C63FF]" : "text-[#4B5563]"
                        }
                      `}
                    >
                      {tab.label}
                    </span>

                    {/* Active dot — regular tabs only */}
                    {!isAI && (
                      <span
                        className={`
                          absolute -bottom-1.5 left-1/2 -translate-x-1/2
                          w-1 h-1 rounded-full bg-[#6C63FF]
                          transition-all duration-300
                          ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"}
                        `}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
    }
