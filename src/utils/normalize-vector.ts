export function normalizeVector(vec: number[]): number[] {
	const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
	return vec.map((v) => v / norm);
}
