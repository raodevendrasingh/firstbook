const WHITESPACE_REGEX = /\s+/g;

export async function extractTextFromFile(
	buffer: Buffer,
	mimeType: string,
): Promise<string> {
	try {
		switch (mimeType) {
			case "application/pdf":
				return await extractTextFromPDF(buffer);

			case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				return await extractWordDocument(buffer, "docx");

			case "application/msword":
				return await extractWordDocument(buffer, "doc");

			case "text/plain":
			case "text/markdown": {
				const textContent = buffer.toString("utf-8");
				return textContent;
			}

			default:
				return "";
		}
	} catch (_error) {
		return "";
	}
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
	try {
		const { extractText } = await import("unpdf");
		const { text } = await extractText(new Uint8Array(buffer));
		const fullText = Array.isArray(text) ? text.join("\n") : text;
		return fullText.trim().substring(0, 200_000);
	} catch (_error) {
		return "";
	}
}

async function extractWordDocument(
	buffer: Buffer,
	format: "docx" | "doc",
): Promise<string> {
	try {
		if (format === "docx") {
			const { default: mammoth } = await import("mammoth");
			const result = await mammoth.extractRawText({ buffer });
			return result.value.trim().substring(0, 100_000);
		}

		return extractBasicText(buffer);
	} catch (_error) {
		return extractBasicText(buffer);
	}
}

function extractBasicText(buffer: Buffer): string {
	try {
		const text = buffer.toString("utf-8");

		let cleanText = text;
		for (let i = 0; i <= 31; i++) {
			cleanText = cleanText.replace(
				new RegExp(String.fromCharCode(i), "g"),
				" ",
			);
		}
		for (let i = 127; i <= 159; i++) {
			cleanText = cleanText.replace(
				new RegExp(String.fromCharCode(i), "g"),
				" ",
			);
		}

		cleanText = cleanText.replace(WHITESPACE_REGEX, " ").trim();

		return cleanText.length >= 10 ? cleanText.substring(0, 100_000) : "";
	} catch {
		return "";
	}
}

export function cleanExtractedText(text: string): string {
	return text.replace(/\0/g, "").replace(/\s+/g, " ").trim();
}

export function generateTitleFromFilename(fileName: string): string {
	const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");

	const readable = nameWithoutExt.replace(/[_-]/g, " ");

	return readable.replace(
		/\w\S*/g,
		(txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
	);
}
