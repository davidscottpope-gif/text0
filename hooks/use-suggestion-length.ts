import {
	DEFAULT_SUGGESTION_LENGTH,
	type SuggestionLength,
	parseSuggestionLength,
} from "@/lib/suggestion-length";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "suggestion-length";

// One browser-wide preference, rather than a setting tied to a document.
export function useSuggestionLength() {
	const [length, setLength] = useState<SuggestionLength>(
		DEFAULT_SUGGESTION_LENGTH,
	);

	useEffect(() => {
		try {
			setLength(parseSuggestionLength(localStorage.getItem(STORAGE_KEY)));
		} catch {
			// Private browsing / blocked storage: keep the short default.
		}
		const sync = (event: StorageEvent) => {
			if (event.key === STORAGE_KEY || event.key === null) {
				setLength(parseSuggestionLength(event.newValue));
			}
		};
		window.addEventListener("storage", sync);
		return () => window.removeEventListener("storage", sync);
	}, []);

	const updateLength = useCallback((next: SuggestionLength) => {
		setLength(next);
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// The current tab still gets the new preference.
		}
	}, []);

	return [length, updateLength] as const;
}
