// Use fetch-based call so we don't depend on the OpenAI SDK types at compile time.
// This also matches the rest of the backend repo style (fetch-based provider).

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type {} from 'openai'


export type GetAiReplyParams = {
  userId: number
  message: string
  timeoutMs?: number
}

// Provider: OpenAI (or OpenAI-compatible endpoint)
// Env vars:
// - OPENAI_API_KEY (required)
// - OPENAI_BASE_URL (optional; e.g. for OpenAI-compatible providers)
// - OPENAI_MODEL (optional; default: gpt-4o-mini)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL, // Optional: for custom endpoints
})

const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

const withTimeout = async <T,>(p: Promise<T>, timeoutMs: number): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('AI timeout')), timeoutMs)

    p.then((v) => {
      clearTimeout(t)
      resolve(v)
    }).catch((e) => {
      clearTimeout(t)
      reject(e)
    })
  })
}

const getSystemPrompt = () =>
  'You are CampusOS AI, a helpful and friendly AI assistant for students. Provide concise, accurate, and actionable guidance.'

/**
 * Generates an AI reply for the given user/message.
 * Kept as a small wrapper so the provider can be swapped later.
 */
export const getAiReply = async ({ userId, message, timeoutMs = 25_000 }: GetAiReplyParams): Promise<{ reply: string }> => {
  const trimmed = message.trim()
  if (!trimmed) return { reply: '' }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('Missing OPENAI_API_KEY on server')
  }

  const completionPromise = openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: getSystemPrompt() },
      {
        role: 'user',
        content: `UserId: ${userId}\nUser message: ${trimmed}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  })

  try {
    const completion: any = await withTimeout(completionPromise, timeoutMs)
    const reply: string | undefined = completion?.choices?.[0]?.message?.content
    return { reply: reply || "I'm sorry, I couldn't generate a response. Please try again." }
  } catch (err) {
    const msg = String((err as any)?.message ?? err)
    if (msg.toLowerCase().includes('timeout')) {
      // Let routes translate into 504
      throw new Error('AI timeout')
    }
    console.error('Error getting ai reply:', err)
    throw new Error('Failed to get response from AI service.')
  }
}

