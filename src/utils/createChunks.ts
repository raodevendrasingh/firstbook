export function createChunks(text: string) {
	const maxChunkSize = 8000;

	const chunks: string[] = [];

	for (let i = 0; i < text.length; i += maxChunkSize) {
		chunks.push(text.slice(i, i + maxChunkSize));
	}

	return chunks;
}
