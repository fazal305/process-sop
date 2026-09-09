// Deterministic "tool retrieval" + local draft synthesis. Nothing here calls
// a network API — CALCULATOR does real arithmetic, everything else returns
// a fixed, clearly-labeled demo payload derived from the input text so the
// same request always produces the same result.

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const CONDITIONS = ['Partly cloudy', 'Clear skies', 'Light rain expected', 'Overcast', 'Sunny'];

function extractLocation(input) {
  const match = input.match(/\bin\s+([A-Z][a-zA-Z]+)/);
  return match ? match[1] : 'the requested location';
}

function extractArithmetic(input) {
  const match = input.match(/(-?\d+(?:\.\d+)?)\s*([x×*+\-/÷])\s*(-?\d+(?:\.\d+)?)/i);
  if (!match) return null;

  const [, aRaw, opRaw, bRaw] = match;
  const a = Number(aRaw);
  const b = Number(bRaw);
  const op = opRaw === 'x' || opRaw === '*' || opRaw === '×' ? '×' : opRaw === '÷' || opRaw === '/' ? '÷' : opRaw;

  let result;
  switch (op) {
    case '×':
      result = a * b;
      break;
    case '÷':
      result = b !== 0 ? a / b : null;
      break;
    case '+':
      result = a + b;
      break;
    case '-':
      result = a - b;
      break;
    default:
      result = null;
  }

  if (result === null) return null;
  return { a, b, op, result };
}

// Simulates retrieving information via the tool selected in Stage 03.
// CALCULATOR is real math; everything else is a fixed demo payload.
export function simulateToolCall(tool, input) {
  if (tool === 'CALCULATOR') {
    const arithmetic = extractArithmetic(input);
    if (!arithmetic) {
      return { tool, ok: false, summary: 'No parseable arithmetic expression found.' };
    }
    return {
      tool,
      ok: true,
      demo: false,
      expression: `${arithmetic.a} ${arithmetic.op} ${arithmetic.b}`,
      result: arithmetic.result,
      summary: `${arithmetic.a} ${arithmetic.op} ${arithmetic.b} = ${arithmetic.result}`,
    };
  }

  if (tool === 'WEB_SEARCH') {
    const location = extractLocation(input);
    const seed = hashString(location + input.length);
    const condition = CONDITIONS[seed % CONDITIONS.length];
    const highC = 24 + (seed % 12);
    return {
      tool,
      ok: true,
      demo: true,
      location,
      condition,
      highC,
      summary: `${location} — tomorrow: ${condition.toLowerCase()}, high ${highC}°C. (SIMULATION — no live weather API is connected)`,
    };
  }

  if (tool === 'FILE_PROCESSING' || tool === 'EXTERNAL_API') {
    return {
      tool,
      ok: true,
      demo: true,
      summary: `${tool.replace('_', ' ').toLowerCase()} result unavailable in this demo — no such integration is connected.`,
    };
  }

  return null;
}

// Local, deterministic draft — used whenever no OpenRouter key is supplied,
// or as the fallback if a live call fails.
export function localSynthesize(input, toolResult) {
  if (toolResult?.tool === 'CALCULATOR' && toolResult.ok) {
    return `${toolResult.expression} = ${toolResult.result}`;
  }

  if (toolResult?.tool === 'WEB_SEARCH' && toolResult.ok) {
    return `${toolResult.location} — tomorrow: ${toolResult.condition.toLowerCase()}, high ${toolResult.highC}°C.`;
  }

  if (toolResult && !toolResult.ok) {
    return `Unable to complete this request: ${toolResult.summary}`;
  }

  return `Acknowledged: "${input}". No external tool was required, so this draft is composed directly from the request and its context.`;
}
