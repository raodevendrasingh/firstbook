import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const config = {
	runtime: "nodejs",
	matcher: ["/notebooks", "/notebook/:path*", "/sign-in", "/sign-up", "/"],
};

export async function middleware(request: NextRequest) {
	const url = request.nextUrl;

	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (
			session &&
			(url.pathname.startsWith("/sign-in") ||
				url.pathname.startsWith("/sign-up") ||
				url.pathname === "/")
		) {
			return NextResponse.redirect(new URL("/notebooks", request.url));
		}

		if (!session && url.pathname.startsWith("/notebooks")) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}

		if (!session && url.pathname.startsWith("/notebook")) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}

		return NextResponse.next();
	} catch {
		if (url.pathname.startsWith("/notebooks")) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
		return NextResponse.next();
	}
}
