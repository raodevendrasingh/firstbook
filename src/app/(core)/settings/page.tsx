"use client";

import { Info, Key, LogOut, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiKeyManager } from "@/components/api-key-manager";
import { CredentialManager } from "@/components/credential-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useFetchR2Credentials } from "@/hooks/use-r2-credentials";
import { authClient } from "@/lib/auth-client";
import type { UserSession } from "@/types/data-types";
import { loadAvatar } from "@/utils/avatar-utils";

export default function SettingsPage() {
	const [session, setSession] = useState<UserSession | null>(null);
	const [sessionLoading, setSessionLoading] = useState<boolean>(true);
	const [sessionError, setSessionError] = useState<boolean>(false);
	const [fileUploadsEnabled, setFileUploadsEnabled] =
		useState<boolean>(false);

	useEffect(() => {
		try {
			const savedState = localStorage.getItem("fileUploadsEnabled");
			if (savedState !== null) {
				setFileUploadsEnabled(JSON.parse(savedState));
			}
		} catch (_error) {
			// If parsing fails, keep the default value (false)
		}
	}, []);
	const router = useRouter();

	const { data: r2Credentials } = useFetchR2Credentials();
	const hasR2Credentials = !!r2Credentials;

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const sessionData = await authClient.getSession();
				setSession(sessionData.data);
			} catch (_error) {
				setSessionError(true);
			} finally {
				setSessionLoading(false);
			}
		};
		fetchSession();
	}, []);

	if (sessionLoading) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<div className="space-y-6">
					<div>
						<Skeleton className="h-8 w-32 mb-2" />
						<Skeleton className="h-4 w-64" />
					</div>
					<Skeleton className="h-40 w-full rounded-xl" />
					<Skeleton className="h-48 w-full rounded-xl" />
					<Skeleton className="h-48 w-full rounded-xl" />
				</div>
			</div>
		);
	}

	if (sessionError || !session?.user?.id) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<div className="space-y-6">
					<div>
						<h1 className="text-3xl font-semibold">Settings</h1>
						<p className="text-muted-foreground mt-2">
							Manage your account settings and API keys
						</p>
					</div>
					<Card className="rounded-xl">
						<CardContent className="pt-6">
							<div className="text-center py-8">
								<p className="text-muted-foreground">
									{sessionError
										? "Failed to load session. Please try refreshing the page."
										: "No active session found. Please sign in to access settings."}
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const handleLogout = async () => {
		setSessionLoading(true);
		try {
			await authClient.signOut();
			setSession(null);
			router.push("/");
		} catch (_error) {
			toast.error("Error logging out");
			return;
		}
		setSessionLoading(false);
	};

	const avatarData = loadAvatar(session?.user!);

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-semibold">Settings</h1>
					<p className="text-muted-foreground mt-2">
						Manage your account settings and API keys
					</p>
				</div>

				<Card className="rounded-xl">
					<CardHeader>
						<CardTitle className="text-xl font-semibold">
							User Profile
						</CardTitle>
					</CardHeader>
					<CardContent>
						{sessionLoading ? (
							<SettingsSkeleton />
						) : (
							<div className="flex flex-col sm:flex-row gap-5 items-center sm:items-center sm:justify-between w-full">
								<div className="flex flex-1 items-center w-full">
									<Avatar className="h-12 w-12 sm:h-16 sm:w-16">
										<AvatarImage src={avatarData.image} />
										<AvatarFallback className="text-lg sm:text-2xl font-semibold">
											{avatarData.initials}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 space-y-1 ml-4">
										<h3 className="text-lg sm:text-xl font-semibold text-foreground">
											{session?.user.name ||
												"Unknown User"}
										</h3>
										<p className="text-muted-foreground text-sm sm:text-base">
											{session?.user.email ||
												"No email provided"}
										</p>
									</div>
								</div>
								<div className="flex items-center justify-end w-full sm:w-fit mt-4 sm:mt-0">
									<Button
										variant="secondary"
										onClick={handleLogout}
										className="rounded-xl bg-rose-600 hover:bg-rose-700"
									>
										<LogOut className="h-4 w-4 mr-2" />
										Logout
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="rounded-xl">
					<CardHeader>
						<CardTitle className="text-xl font-semibold flex items-center justify-between">
							<div className="flex items-center">
								<Key className="h-5 w-5 mr-2" />
								API Keys
							</div>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 w-6 p-0 hover:bg-muted rounded-full"
									>
										<Info className="h-4 w-4 text-muted-foreground" />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-80 p-0 rounded-2xl bg-background border-0"
									align="end"
								>
									<div className="space-y-3 p-4 bg-accent/10 rounded-2xl">
										<h4 className="font-semibold text-sm">
											API Key Information
										</h4>
										<ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
											<li>
												Keys are encrypted and stored
												securely in the database
											</li>
											<li>
												Add Exa API key and at least one
												LLM API key to make the app work
											</li>
										</ul>
									</div>
								</PopoverContent>
							</Popover>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{sessionLoading ? (
							<SettingsSkeleton />
						) : (
							<ApiKeyManager />
						)}
					</CardContent>
				</Card>

				<Card className="rounded-xl">
					<CardHeader>
						<CardTitle className="text-xl font-semibold flex items-center justify-between">
							<div className="flex items-center">
								<Upload className="h-5 w-5 mr-2" />
								File uploads
							</div>
							<div className="flex items-center gap-2">
								<Switch
									checked={fileUploadsEnabled}
									onCheckedChange={(checked) => {
										setFileUploadsEnabled(checked);
										localStorage.setItem(
											"fileUploadsEnabled",
											JSON.stringify(checked),
										);
									}}
									disabled={!hasR2Credentials}
								/>
								<span className="text-sm text-muted-foreground">
									{fileUploadsEnabled
										? "Enabled"
										: "Disabled"}
								</span>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{sessionLoading ? (
							<SettingsSkeleton />
						) : (
							<CredentialManager />
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function SettingsSkeleton() {
	return (
		<div className="flex flex-col sm:flex-row gap-5 items-center sm:items-center sm:justify-between w-full">
			<div className="flex flex-1 items-center w-full">
				<Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" />
				<div className="flex-1 space-y-1 ml-4">
					<Skeleton className="h-6 w-48 sm:h-7" />
					<Skeleton className="h-4 w-64" />
				</div>
			</div>
			<div className="flex items-center justify-end w-full sm:w-fit mt-4 sm:mt-0">
				<Skeleton className="h-9 w-20 rounded-xl" />
			</div>
		</div>
	);
}
