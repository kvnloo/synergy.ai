/**
 * Pure parser for spoken Synergy UI commands.
 *
 * Bare "Synergy <phrase>" only becomes a command when <phrase> is a
 * known local action. Unknown bare phrases fall back to dictation so
 * sentences such as "Synergy is useful" are never swallowed.
 *
 * "Hey Synergy ..." and "Synergy command ..." are explicit command
 * forms. Unknown explicit commands are returned as matched with a null
 * action so the UI can report that it did not guess.
 */

const ALIASES = new Map([
  ["next", "next"],
  ["next slide", "next"],
  ["go forward", "next"],
  ["forward", "next"],

  ["previous", "previous"],
  ["previous slide", "previous"],
  ["back", "previous"],
  ["go back", "previous"],
  ["back one", "previous"],

  ["sources", "open_sources"],
  ["open sources", "open_sources"],
  ["show sources", "open_sources"],
  ["evidence", "open_sources"],
  ["open evidence", "open_sources"],
  ["show evidence", "open_sources"],

  ["close sources", "close_sources"],
  ["hide sources", "close_sources"],
  ["close evidence", "close_sources"],
  ["hide evidence", "close_sources"],

  ["read", "read_aloud"],
  ["read aloud", "read_aloud"],
  ["read this", "read_aloud"],
  ["read this aloud", "read_aloud"],
  ["start reading", "read_aloud"],

  ["stop reading", "stop_reading"],
  ["stop read aloud", "stop_reading"],
  ["stop aloud", "stop_reading"],

  ["close", "close_reader"],
  ["close reader", "close_reader"],
  ["exit reader", "close_reader"],
  ["exit", "close_reader"],

  ["stop listening", "stop_listening"],
  ["stop voice", "stop_listening"],
  ["microphone off", "stop_listening"]
]);

function normalizePhrase(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[.!?]+$/g, "")
    .replace(/[_/\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resultFor(phrase, explicit) {
  const normalized = normalizePhrase(phrase);
  const action = ALIASES.get(normalized) || null;
  if (!action && !explicit) return null;
  return {
    matched: true,
    action,
    phrase: normalized,
    explicit
  };
}

export function parseVoiceCommand(transcript) {
  const raw = String(transcript || "").trim();
  if (!raw) return null;

  let match = raw.match(/^hey\s+synergy(?:\s*[,;:]?\s*)(.*)$/i);
  if (match) return resultFor(match[1], true);

  match = raw.match(/^synergy\s+command(?:\s*[,;:]?\s*)(.*)$/i);
  if (match) return resultFor(match[1], true);

  match = raw.match(/^synergy(?:\s*[,;:]?\s+)(.*)$/i);
  if (match) return resultFor(match[1], false);

  return null;
}

export const VOICE_COMMAND_ACTIONS = Object.freeze([
  "next",
  "previous",
  "open_sources",
  "close_sources",
  "read_aloud",
  "stop_reading",
  "close_reader",
  "stop_listening"
]);
