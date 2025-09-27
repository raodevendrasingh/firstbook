"use client";

import { Info, Key, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiKeyManager } from "@/components/api-key-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import type { UserSession } from "@/types/data-types";
import { loadAvatar } from "@/utils/avatar-utils";

interface SettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
	const [session, setSession] = useState<UserSession | null>(null);
	const [sessionLoading, setSessionLoading] = useState<boolean>(true);
	const router = useRouter();

	useEffect(() => {
		if (open) {
			const fetchSession = async () => {
				try {
					const sessionData = await authClient.getSession();
					setSession(sessionData.data);
				} catch (_error) {
				} finally {
					setSessionLoading(false);
				}
			};
			fetchSession();
		}
	}, [open]);

	if (!session?.user?.id) {
		return null;
	}

	const handleLogout = async () => {
		setSessionLoading(true);
		await authClient.signOut();
		router.push("/");
		setSession(null);
		setSessionLoading(false);
		onOpenChange(false);
	};

	const avatarData = loadAvatar(session?.user!);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl w-full max-h-[90vh] h-full flex flex-col rounded-3xl">
				<DialogHeader>
					<DialogTitle className="text-2xl font-semibold">
						Settings
					</DialogTitle>
				</DialogHeader>

				<section className="flex flex-col gap-3 flex-1 min-h-0">
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
											<AvatarImage
												src={avatarData.image}
											/>
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

					<Card className="flex-1 flex flex-col min-h-0 rounded-xl">
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
													Keys are encrypted and
													stored securely in the
													database
												</li>
												<li>
													Add Exa API key and at least
													one LLM API key to make the
													app work
												</li>
											</ul>
										</div>
									</PopoverContent>
								</Popover>
							</CardTitle>
						</CardHeader>
						<CardContent className="flex-1 min-h-0">
							{sessionLoading ? (
								<SettingsSkeleton />
							) : (
								<ApiKeyManager />
							)}
						</CardContent>
					</Card>
				</section>
			</DialogContent>
		</Dialog>
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
