import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = env.NEXT_PUBLIC_APP_URL;

	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/"],
				disallow: ["/api/", "/api/*", "/sign-in", "/sign-up"],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
