import type { User } from "better-auth";

/**
 * Generate user initials from name
 */
export function getUserInitials(name: string | null | undefined): string {
	if (!name || name.trim().length === 0) return "U";

	const parts = name.trim().split(" ");
	if (parts.length === 0 || !parts[0]) return "U";
	if (parts.length === 1) return parts[0][0].toUpperCase();

	return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
}

/**
 * Load avatar component with proper fallback
 */
export function loadAvatar(user: User) {
	const image = user?.image || "";
	const name = user?.name || "";
	const initials = getUserInitials(name);

	return { image, initials };
}
