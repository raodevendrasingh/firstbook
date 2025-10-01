import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = env.NEXT_PUBLIC_APP_URL;

	const staticRoutes = ["/", "/notebooks"];

	return staticRoutes.map((path) => ({
		url: `${baseUrl}${path}`,
		lastModified: new Date(),
		changeFrequency: path === "/" ? "weekly" : "weekly",
		priority: path === "/" ? 1 : 0.7,
	}));
}
