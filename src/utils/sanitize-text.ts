/** biome-ignore-all lint/complexity/useRegexLiterals: ignore */

export function sanitizeText(
	input: string | null | undefined,
	maxLength = 10000,
): string {
	if (!input) return "";

	// Normalize line endings
	let out = input.replace(/\r\n?/g, "\n");

	// Remove HTML tags
	out = out.replace(/<[^>\n]*>/g, "");

	// Remove Markdown images: ![alt](url)
	out = out.replace(/!\[[^\]]*\]\([^)]+\)/g, "");

	// Convert Markdown links [text](url) -> text
	out = out.replace(/\[([^\]]+)\]\((?:[^)]+)\)/g, "$1");

	// Remove leftover Markdown headers/emphasis markers
	out = out.replace(/^\s{0,3}#{1,6}\s+/gm, ""); // headers
	out = out.replace(/(\*{1,2}|_{1,2})(.*?)\1/g, "$2"); // bold/italic

	// Decode common HTML entities
	out = out
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");

	// Remove control characters except tab/newline
	out = out.replace(
		new RegExp("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]", "g"),
		"",
	);

	// Collapse excessive whitespace and blank lines
	out = out.replace(/[ \t]+/g, " ");
	out = out.replace(/\n{3,}/g, "\n\n");

	// Trim and enforce max length
	out = out.trim();
	if (out.length > maxLength) {
		out = `${out.slice(0, maxLength - 1).trimEnd()}…`;
	}

	return out;
}
