/** @feature F-voice-control — see TRACEABILITY.json */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseVoiceCommand, VOICE_COMMAND_ACTIONS } from "../../voice-commands.js";

describe("voice commands", () => {
  it("leaves ordinary dictation alone", () => {
    assert.equal(parseVoiceCommand("this is ordinary dictation"), null);
    assert.equal(parseVoiceCommand("Synergy is a useful idea"), null);
  });

  it("accepts known bare Synergy shorthands", () => {
    assert.equal(parseVoiceCommand("Synergy next")?.action, "next");
    assert.equal(parseVoiceCommand("Synergy, show sources.")?.action, "open_sources");
    assert.equal(parseVoiceCommand("SYNERGY go back!")?.action, "previous");
  });

  it("accepts explicit wake forms and normalizes punctuation", () => {
    assert.equal(parseVoiceCommand("Hey Synergy, read this aloud.")?.action, "read_aloud");
    assert.equal(parseVoiceCommand("Synergy command: stop voice!")?.action, "stop_listening");
  });

  it("reports unknown explicit commands without guessing", () => {
    const parsed = parseVoiceCommand("Hey Synergy launch the rocket");
    assert.equal(parsed?.matched, true);
    assert.equal(parsed?.action, null);
    assert.equal(parsed?.explicit, true);
  });

  it("falls back to dictation for an unknown bare product-name phrase", () => {
    assert.equal(parseVoiceCommand("Synergy launch the rocket"), null);
  });

  it("covers a fixed closed action vocabulary", () => {
    assert.deepEqual(VOICE_COMMAND_ACTIONS, [
      "next",
      "previous",
      "open_sources",
      "close_sources",
      "read_aloud",
      "stop_reading",
      "close_reader",
      "stop_listening"
    ]);
  });
});
