const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';
const TIMEOUT_MS = 20000;

export const OPENROUTER_DEFAULT_MODEL = DEFAULT_MODEL;

// Calls OpenRouter directly from the browser using a visitor-supplied key.
// The key is never sent anywhere but openrouter.ai — there is no backend
// in this app to proxy it through.
export async function callOpenRouter({ apiKey, model, input, toolResult }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const contextNote = toolResult?.ok
    ? `Retrieved information available to you: ${toolResult.summary}`
    : 'No external tool retrieval was required for this request.';

  try {
    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are the content-synthesis step of a demonstration pipeline. Answer the user request directly and concisely, in at most 3 sentences. Use any retrieved information provided.',
          },
          { role: 'user', content: `${contextNote}\n\nRequest: ${input}` },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error?.message || `OpenRouter request failed (${response.status})`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('OpenRouter returned an empty response.');
    return text;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('OpenRouter request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
