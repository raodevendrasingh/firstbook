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

export const fileSchema = z.object({
	files: z
		.array(
			z.object({
				name: z.string(),
				size: z.number(),
				type: z.string(),
				data: z.string(),
			}),
		)
		.refine((files) => files.length > 0, {
			message: "At least one file is required",
		})
		.refine((files) => files.length <= 5, {
			message: "You can only upload up to 5 files",
		})
		.refine(
			(files) => files.every((file) => file.size <= 10 * 1024 * 1024),
			{
				message: "Each file must be smaller than 10MB",
			},
		)
		.refine(
			(files) =>
				files.every((file) =>
					[
						"application/pdf",
						"application/msword",
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
						"text/plain",
						"text/markdown",
					].includes(file.type),
				),
			{
				message: "Only PDF, DOC, DOCX, TXT, and MD files are supported",
			},
		),
});

export type ResourceData = z.infer<typeof resourceSchema>;
export type FileData = z.infer<typeof fileSchema>;
