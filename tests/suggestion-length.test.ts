import { strict as assert } from "node:assert";
import { test } from "node:test";
import { parseCompletion } from "../lib/parse-completion";
import {
	DEFAULT_SUGGESTION_LENGTH,
	SUGGESTION_LENGTHS,
	completionLengthRule,
	limitSuggestion,
	parseSuggestionLength,
	suggestionConfig,
} from "../lib/suggestion-length";

test("untrusted preference falls back to today's short budget", () => {
	for (const value of [undefined, null, "unlimited", "__proto__", {}, 123]) {
		assert.equal(parseSuggestionLength(value), DEFAULT_SUGGESTION_LENGTH);
	}
	assert.equal(
		SUGGESTION_LENGTHS[parseSuggestionLength("short")].maxTokens,
		50,
	);
	assert.equal(
		SUGGESTION_LENGTHS[parseSuggestionLength("medium")].maxTokens,
		160,
	);
	assert.equal(
		SUGGESTION_LENGTHS[parseSuggestionLength("long")].maxTokens,
		400,
	);
});

test("partial stream is visible before its closing tag, with no XML leakage", () => {
	assert.equal(parseCompletion("<complet", "Hi", 80), "");
	assert.equal(parseCompletion("<completion> there", "Hi", 80), "there");
	assert.equal(parseCompletion("<completion> there</com", "Hi", 80), "there");
	assert.equal(
		parseCompletion("<completion> there</completion>", "Hi", 80),
		"there",
	);
	assert.equal(parseCompletion("<completion> there", "Hi ", 80), "there");
});

test("suggestion cap applies to unfinished and finished streams", () => {
	assert.equal(parseCompletion("<completion>abcdef", "x", 3), "abc");
	assert.equal(
		parseCompletion("<completion>abcdef</completion>", "x", 3),
		"abc",
	);
	assert.equal(limitSuggestion("🙂🙂", 1), "🙂");
});

test("preserves code indentation and removes incidental line-leading spaces", () => {
	assert.equal(
		parseCompletion("<completion> one\n two\n    code", "x", 80),
		"one\ntwo\n    code",
	);
});

test("route's prompt and token budget use the same validated preference", () => {
	assert.equal(
		completionLengthRule("long"),
		"Suggest up to 100 words and 600 characters maximum",
	);
	assert.equal(suggestionConfig("long").maxTokens, 400);
	assert.equal(
		completionLengthRule("__proto__"),
		"Suggest up to 10 words and 80 characters maximum",
	);
	assert.equal(suggestionConfig("__proto__").maxTokens, 50);
});
