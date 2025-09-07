"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { type SignInData, signInSchema } from "@/lib/auth-schema";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getInputType } from "../_components/get-input-type";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleAuthButton } from "../_components/google-auth-button";

export default function SignIn() {
	const router = useRouter();

	const [isPending, setIsPending] = useState(false);

	const form = useForm<SignInData>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: SignInData) => {
		await authClient.signIn.email(
			{
				email: data.email,
				password: data.password,
			},
			{
				onRequest: () => {
					setIsPending(true);
				},
				onSuccess: async () => {
					toast.success("Signed in successfully");
					router.push("/notebooks");
				},
				onError: (ctx) => {
					setIsPending(false);
					toast.error("Failed to sign in", {
						description:
							typeof ctx.error === "string"
								? ctx.error
								: ctx.error?.message || "Unknown error",
					});
				},
			},
		);
	};
	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-accent/30 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-2">
				<Card className="rounded-2xl border-none bg-transparent shadow-none">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">Welcome Back</CardTitle>
						<CardDescription>
							Continue with your Google account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)}>
								<div className="grid gap-5">
									<GoogleAuthButton />
									<div className="flex items-center text-sm">
										<Separator className="flex-1" />
										<span className="px-2 text-muted-foreground">
											Or continue with
										</span>
										<Separator className="flex-1" />
									</div>
									<div className="space-y-3">
										{["email", "password"].map((field) => (
											<FormField
												control={form.control}
												key={field}
												name={field as keyof SignInData}
												render={({
													field: fieldProps,
												}) => (
													<FormItem>
														<FormLabel>
															{field
																.charAt(0)
																.toUpperCase() +
																field.slice(1)}
														</FormLabel>
														<FormControl>
															<div className="relative">
																<Input
																	placeholder=""
																	type={getInputType(
																		field,
																	)}
																	{...fieldProps}
																	autoComplete="off"
																/>
															</div>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										))}
									</div>
									<Button>
										{isPending ? (
											<Loader2 className="animate-spin" />
										) : (
											"Sign In"
										)}
									</Button>
									<div className="text-center text-sm">
										Dont have an account?{" "}
										<Link
											className="text-primary hover:underline"
											href="/sign-up"
										>
											Sign Up
										</Link>
									</div>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
