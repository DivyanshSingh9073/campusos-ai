import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, clearToken } from '../lib/api'

import {
  HiOutlineSparkles,
  HiOutlinePaperAirplane,
  HiOutlineTrash,
} from 'react-icons/hi'


type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2" aria-label="AI is typing">
      <span className="h-2.5 w-2.5 rounded-full bg-[#6C63FF] animate-[bounce_1s_infinite]" style={{ animationDelay: '0ms' }} />
      <span className="h-2.5 w-2.5 rounded-full bg-[#6C63FF] animate-[bounce_1s_infinite]" style={{ animationDelay: '120ms' }} />
      <span className="h-2.5 w-2.5 rounded-full bg-[#6C63FF] animate-[bounce_1s_infinite]" style={{ animationDelay: '240ms' }} />
    </div>
  )
}


function isAuthError(message: string): boolean {
  const m = message.toLowerCase()
  return m.includes('token') || m.includes('authorization') || m.includes('unauthorized') || m.includes('401')
}

export default function AssistantPage() {
  const navigate = useNavigate()

  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)


  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading])

  useEffect(() => {
    // Empty by design: show an empty-state panel.
    setMessages([])
  }, [])

  useEffect(() => {
    // Auto-scroll to latest message.
    if (!endRef.current) return
    endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const clearChat = () => {
    setError(null)
    setMessages([])
  }


  const send = async () => {
    setError(null)

    const text = input.trim()
    if (!text) return

    setInput('')
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text }
    const assistantPlaceholder: ChatMessage = { id: uid(), role: 'assistant', content: '...' }

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder])
    setLoading(true)

    try {
      const res = await api.ai.chat({ message: text })
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantPlaceholder.id ? { ...m, content: res.reply ?? '' } : m))
      )
    } catch (e: any) {
      const msg = String(e?.message ?? e)

      if (isAuthError(msg)) {
        clearToken()
        navigate('/', { replace: true })
        return
      }

      let friendly = 'Couldn’t get response.'
      const lower = msg.toLowerCase()
      if (lower.includes('timeout')) friendly = 'AI request timed out. Please try again.'
      if (lower.includes('network') || lower.includes('fetch')) friendly = 'Network error. Check your connection.'
      if (lower.includes('ai timeout')) friendly = 'AI request timed out. Please try again.'

      setError(msg)
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantPlaceholder.id ? { ...m, content: friendly } : m))
      )
    } finally {
      setLoading(false)
    }

  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] px-4 pt-10 pb-[calc(7rem+env(safe-area-inset-bottom))] overflow-x-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-110px] left-1/2 -translate-x-1/2 w-[480px] h-[340px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.16) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative mx-auto max-w-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <HiOutlineSparkles className="w-5 h-5 text-[#A78BFA]" />
            <h1 className="text-xl font-bold text-white" style={{ letterSpacing: '-0.03em' }}>
              AI Assistant
            </h1>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">Ask questions, request summaries, get study help.</p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Conversation</p>
            <button
              type="button"
              onClick={clearChat}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#E2E8F0] hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
            >
              <HiOutlineTrash className="w-4 h-4" /> Clear
            </button>
          </div>

          <div ref={listRef} className="px-4 py-3 max-h-[55vh] overflow-auto space-y-3">
            {messages.length === 0 ? (
              <div className="py-10 text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-[#6C63FF]/12 ring-1 ring-[#6C63FF]/20 flex items-center justify-center">
                  <HiOutlineSparkles className="w-5 h-5 text-[#6C63FF]" />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">👋 Hi!</p>
                <p className="mt-1 text-xs text-[#64748B]">I'm CampusOS AI. Ask me anything about your studies.</p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      m.role === 'user'
                        ? 'max-w-[80%] rounded-2xl bg-[#6C63FF] text-white px-4 py-3'
                        : 'max-w-[80%] rounded-2xl bg-white/[0.04] border border-white/[0.06] text-[#E2E8F0] px-4 py-3'
                    }
                  >
                    {m.content === '...' && loading && m.role === 'assistant' ? (
                      <TypingIndicator />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-snug">{m.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>


          {error && (
            <div className="px-4 pb-3">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                <p className="text-sm font-semibold text-red-200">Couldn’t get response</p>
                <p className="mt-1 text-xs text-red-200/80">{error}</p>
              </div>
            </div>
          )}

          <div className="p-3 border-t border-white/[0.05]">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about notes, tasks, concepts..."
                className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-3 text-sm text-white placeholder:text-[#64748B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (canSend) void send()
                  }
                }}
              />
              <button
                type="button"
                disabled={!canSend}
                onClick={() => void send()}
                className="inline-flex items-center justify-center rounded-xl bg-[#6C63FF] px-3 py-3 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
                aria-label="Send message"
              >
                <HiOutlinePaperAirplane className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[#64748B]">
              Uses your server’s LLM configuration (OPENAI_API_KEY / OPENAI_MODEL).
            </p>
          </div>
        </div>

        {error && messages.length === 0 && (
          <div className="text-center text-xs text-[#94A3B8] mt-1">{error}</div>
        )}

        <div className="text-center text-[10px] text-[#64748B]">
          Tip: Try “Explain Binary Search” or “Summarize my notes for OS Module 4”.
        </div>

      </div>
    </div>
  )
}

