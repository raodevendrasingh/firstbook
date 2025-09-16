import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

	const staticRoutes = ["/", "/notebooks"];

	return staticRoutes.map((path) => ({
		url: `${baseUrl}${path}`,
		lastModified: new Date(),
		changeFrequency: path === "/" ? "weekly" : "weekly",
		priority: path === "/" ? 1 : 0.7,
	}));
}
