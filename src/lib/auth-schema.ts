import { z } from "zod";

export const emailValidation = z
	.email({ message: "Email is required" })
	.min(5, { message: "Email must be at least 5 characters" })
	.max(60, { message: "Email must be less than 60 characters" })
	.regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
		message: "Email must be in a valid format",
	})
	.transform((val) => val.toLowerCase());

export const signUpSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Name is required" })
		.max(50, { message: "Name must be less than 50 characters" }),
	email: emailValidation,
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters" })
		.max(32, { message: "Password must be less than 32 characters" }),
});

export const signInSchema = z.object({
	email: emailValidation,
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters" })
		.max(32, { message: "Password must be less than 32 characters" }),
});

export const resetPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(8, { message: "Password must be at least 8 characters" })
			.max(32, { message: "Password must be less than 32 characters" }),
		confirmPassword: z
			.string()
			.min(8, { message: "Password must be at least 8 characters" })
			.max(32, { message: "Password must be less than 32 characters" }),
		token: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords must match",
		path: ["confirmPassword"],
	});

export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
