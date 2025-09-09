import z from "zod";

export const parseUrls = (str: string) =>
	str
		.split(/[\n,]/)
		.map((s) => s.trim())
		.filter(Boolean);

export const resourceSchema = z.object({
	urls: z
		.string()
		.refine((str) => parseUrls(str).length > 0, {
			message: "URLs are required",
		})
		.refine((str) => parseUrls(str).length <= 5, {
			message: "You can only add up to 5 URLs",
		})
		.refine(
			(str) =>
				parseUrls(str).every((url) => {
					try {
						new URL(url);
						return true;
					} catch {
						return false;
					}
				}),
			{
				message:
					"Please enter valid URLs, separated by commas or new lines",
			},
		),
});

export type ResourceData = z.infer<typeof resourceSchema>;
