export function getCookie(name: string): string | undefined {
	if (typeof document === "undefined") return undefined;

	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop()?.split(";").shift();
	}
	return undefined;
}

export function setCookie(name: string, value: string, days = 365): void {
	if (typeof document === "undefined") return;

	const date = new Date();
	date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
	const expires = `expires=${date.toUTCString()}`;
	document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

export function getServerCookie(
	cookieString: string | undefined,
	name: string,
): string | undefined {
	if (!cookieString) return undefined;

	const cookies = cookieString.split(";").reduce(
		(acc, cookie) => {
			const [key, value] = cookie.trim().split("=");
			acc[key] = value;
			return acc;
		},
		{} as Record<string, string>,
	);

	return cookies[name];
}
