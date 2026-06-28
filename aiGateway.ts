export type AIProvider = 'openai' | 'anthropic' | 'grok' | 'ollama' | 'mock'

export type AIRequest = {
  prompt: string
  system?: string
  provider?: AIProvider | 'auto'
  model?: string
  projectId?: string
}

export type AIResponse = {
  provider: AIProvider
  model: string
  text: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  syncedMemory: boolean
}

const defaultModels: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-latest',
  grok: 'grok-2-latest',
  ollama: 'llama3.1',
  mock: 'advantix-mock-god-mode',
}

export function getProviderStatus() {
  return [
    { id: 'openai', name: 'OpenAI / ChatGPT', configured: Boolean(process.env.OPENAI_API_KEY), defaultModel: defaultModels.openai },
    { id: 'anthropic', name: 'Anthropic Claude', configured: Boolean(process.env.ANTHROPIC_API_KEY), defaultModel: defaultModels.anthropic },
    { id: 'grok', name: 'xAI Grok', configured: Boolean(process.env.XAI_API_KEY), defaultModel: defaultModels.grok },
    { id: 'ollama', name: 'Ollama Local Models', configured: Boolean(process.env.OLLAMA_BASE_URL), defaultModel: defaultModels.ollama },
    { id: 'mock', name: 'Advantix Mock Engine', configured: true, defaultModel: defaultModels.mock },
  ]
}

export function chooseProvider(requested: AIRequest['provider'] = 'auto'): AIProvider {
  if (requested && requested !== 'auto') return requested
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.XAI_API_KEY) return 'grok'
  if (process.env.OLLAMA_BASE_URL) return 'ollama'
  return 'mock'
}

async function callJsonApi(url: string, init: RequestInit) {
  const response = await fetch(url, init)
  if (!response.ok) throw new Error(`Provider request failed: ${response.status} ${await response.text()}`)
  return response.json()
}

export async function runAIRequest(input: AIRequest): Promise<AIResponse> {
  const provider = chooseProvider(input.provider)
  const model = input.model || defaultModels[provider]

  try {
    if (provider === 'openai') {
      const data = await callJsonApi('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: input.system || 'You are Vantix AI Builders.' }, { role: 'user', content: input.prompt }] }),
      })
      return normalize(provider, model, data.choices?.[0]?.message?.content || '', data.usage)
    }

    if (provider === 'anthropic') {
      const data = await callJsonApi('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, max_tokens: 1200, system: input.system || 'You are Vantix AI Builders.', messages: [{ role: 'user', content: input.prompt }] }),
      })
      return normalize(provider, model, data.content?.map((part: any) => part.text).join('\n') || '', { prompt_tokens: data.usage?.input_tokens, completion_tokens: data.usage?.output_tokens })
    }

    if (provider === 'grok') {
      const data = await callJsonApi('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.XAI_API_KEY}` },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: input.system || 'You are Vantix AI Builders.' }, { role: 'user', content: input.prompt }] }),
      })
      return normalize(provider, model, data.choices?.[0]?.message?.content || '', data.usage)
    }

    if (provider === 'ollama') {
      const base = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
      const data = await callJsonApi(`${base}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: `${input.system || 'You are Vantix AI Builders.'}\n\n${input.prompt}`, stream: false }),
      })
      return normalize(provider, model, data.response || '', { prompt_tokens: 0, completion_tokens: 0 })
    }
  } catch (error) {
    return mockResponse(input, `Provider ${provider} failed. Falling back to safe mock engine. ${error instanceof Error ? error.message : ''}`)
  }

  return mockResponse(input)
}

function normalize(provider: AIProvider, model: string, text: string, usage: any): AIResponse {
  const promptTokens = Number(usage?.prompt_tokens || 0)
  const completionTokens = Number(usage?.completion_tokens || 0)
  return { provider, model, text, usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens }, syncedMemory: true }
}

function mockResponse(input: AIRequest, prefix = ''): AIResponse {
  const text = `${prefix}\n\nVantix AI Builders God Mode plan:\n1. Architect the system blueprint.\n2. Design the interface and responsive layout.\n3. Generate frontend, backend, database, and API structure.\n4. Run Error Fixer and QA checks.\n5. Sync Project Memory and prepare deployment.\n\nPrompt processed: ${input.prompt}`.trim()
  return { provider: 'mock', model: defaultModels.mock, text, usage: { promptTokens: input.prompt.length, completionTokens: text.length, totalTokens: input.prompt.length + text.length }, syncedMemory: true }
}
