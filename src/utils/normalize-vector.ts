export function normalizeVector(vec: number[]): number[] {
	const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
	if (!Number.isFinite(norm) || norm === 0) return vec.map(() => 0);
	return vec.map((v) => v / norm);
}
