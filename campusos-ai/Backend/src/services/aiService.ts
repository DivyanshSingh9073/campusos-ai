import 'dotenv/config'

export type AiReplyParams = {
  userId: number
  message: string
  timeoutMs?: number
}

export type AiReplyResult = {
  reply: string
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v || v.trim().length === 0) throw new Error(`Missing required env var: ${name}`)
  return v
}

function createTimeoutPromise(timeoutMs: number) {
  return new Promise<never>((_resolve, reject) => {
    const t = setTimeout(() => {
      clearTimeout(t)
      reject(new Error('AI timeout'))
    }, timeoutMs)
  })
}

/**
 * AI Service
 * - Pluggable: keep this file as the only place that knows how to call providers.
 * - Provider: OpenAI-compatible chat completions endpoint.
 */
export async function getAiReply(params: AiReplyParams): Promise<AiReplyResult> {
  const { userId, message, timeoutMs = 25_000 } = params

  const apiKey = requireEnv('OPENAI_API_KEY')
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
  const baseUrl = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '')

  const prompt =
    `You are CampusOS AI, a helpful assistant for college productivity.\n` +
    `UserId: ${userId}\n` +
    `User message: ${message.trim()}\n\n` +
    `Respond concisely with actionable guidance.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const controllerRequest = fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are CampusOS AI.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
      signal: controller.signal,
    })

    // Ensure we surface a stable timeout error message.
    const response = await Promise.race([
      controllerRequest,
      createTimeoutPromise(timeoutMs),
    ])

    const data: any = await response.json().catch(() => ({}))

    if (!response.ok) {
      const errMsg = data?.error?.message || `LLM request failed: ${response.status}`
      throw new Error(errMsg)
    }

    const text: string | undefined = data?.choices?.[0]?.message?.content
    return { reply: text ?? '' }
  } catch (e: any) {
    // Normalize timeout
    const msg = String(e?.message ?? e)
    if (msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('aborted')) {
      throw new Error('AI timeout')
    }
    throw e
  } finally {
    clearTimeout(timeout)
  }
}

