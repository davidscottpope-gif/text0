import { limitSuggestion } from "./suggestion-length";

/** Parse both an in-progress stream and a finished reply without showing XML tags. */
export function parseCompletion(
	completion: string | undefined,
	input: string,
	maxCharacters: number,
): string {
	const startTag = "<completion>";
	const endTag = "</completion>";
	if (!completion?.startsWith(startTag)) return "";

	const body = completion.slice(startTag.length);
	const close = body.indexOf(endTag);
	let result = close >= 0 ? body.slice(0, close) : body;
	if (close < 0) {
		// The closing tag can arrive one character at a time. Never show its prefix.
		for (
			let length = Math.min(endTag.length - 1, result.length);
			length > 0;
			length--
		) {
			if (result.endsWith(endTag.slice(0, length))) {
				result = result.slice(0, -length);
				break;
			}
		}
	}
	result = limitSuggestion(result, maxCharacters);
	if (input.endsWith(" ") && result.startsWith(" ")) {
		result = result.trimStart();
	}
	return result
		.split("\n")
		.map((line) => {
			if (!line.trim()) return "";
			return /^[\t ]{2,}/.test(line) ? line : line.trimStart();
		})
		.join("\n");
}
