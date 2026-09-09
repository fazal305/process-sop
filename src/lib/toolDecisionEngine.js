// Deterministic, explainable tool-requirement checks. Each function takes
// the raw input string and returns a boolean — no model call, no hidden
// heuristics. This intentionally stays simple rather than becoming an
// agent framework: the SOP calls for a decision layer, not an autonomous one.

const WEB_SEARCH_PATTERN =
  /\b(weather|news|today|latest|current|price of|stock|score|who is|what is the|forecast)\b/i;
const CALCULATION_PATTERN = /(\d+\s*[-+*/x×÷]\s*\d+)|\b(calculate|compute|sum|multiply|divide|percent)\b/i;
const FILE_PATTERN = /\b(this file|attached|uploaded|spreadsheet|csv|document I|the pdf)\b/i;
const LOCATION_PATTERN = /\b(in\s+[A-Z][a-zA-Z]+|near me|karachi|weather in|distance to)\b/;
const TIME_PATTERN = /\b(today|tomorrow|tonight|this week|next week|current time|what time)\b/i;
const API_PATTERN = /\b(exchange rate|currency|convert \d|stock price|crypto price)\b/i;

export function requiresWebSearch(text) {
  return WEB_SEARCH_PATTERN.test(text);
}

export function requiresCalculation(text) {
  return CALCULATION_PATTERN.test(text);
}

export function requiresFileProcessing(text) {
  return FILE_PATTERN.test(text);
}

export function requiresExternalApi(text) {
  return API_PATTERN.test(text);
}

export function requiresLocation(text) {
  return LOCATION_PATTERN.test(text);
}

export function requiresTime(text) {
  return TIME_PATTERN.test(text);
}

// Highest-priority match wins; a request could technically trip more than
// one pattern, but the pipeline invokes a single tool at a time.
export function decideTool(text) {
  if (requiresCalculation(text)) return 'CALCULATOR';
  if (requiresExternalApi(text)) return 'EXTERNAL_API';
  if (requiresFileProcessing(text)) return 'FILE_PROCESSING';
  if (requiresWebSearch(text)) return 'WEB_SEARCH';
  return null;
}

export function evaluateTools(text) {
  const tool = decideTool(text);
  return {
    tool,
    toolsRequired: tool !== null,
    signals: {
      webSearch: requiresWebSearch(text),
      calculation: requiresCalculation(text),
      fileProcessing: requiresFileProcessing(text),
      externalApi: requiresExternalApi(text),
      location: requiresLocation(text),
      time: requiresTime(text),
    },
  };
}
