export const SUGGESTION_LENGTHS = {
	short: { label: "Short", maxCharacters: 80, maxWords: 10, maxTokens: 50 },
	medium: { label: "Medium", maxCharacters: 240, maxWords: 40, maxTokens: 160 },
	long: { label: "Long", maxCharacters: 600, maxWords: 100, maxTokens: 400 },
} as const;

export type SuggestionLength = keyof typeof SUGGESTION_LENGTHS;
export const DEFAULT_SUGGESTION_LENGTH: SuggestionLength = "short";

export function parseSuggestionLength(value: unknown): SuggestionLength {
	return typeof value === "string" && Object.hasOwn(SUGGESTION_LENGTHS, value)
		? (value as SuggestionLength)
		: DEFAULT_SUGGESTION_LENGTH;
}

export function suggestionConfig(value: unknown) {
	return SUGGESTION_LENGTHS[parseSuggestionLength(value)];
}

export function completionLengthRule(value: unknown): string {
	const config = suggestionConfig(value);
	return `Suggest up to ${config.maxWords} words and ${config.maxCharacters} characters maximum`;
}

export function limitSuggestion(text: string, maxCharacters: number): string {
	return Array.from(text).slice(0, maxCharacters).join("");
}
