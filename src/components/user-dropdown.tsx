"use client";

import type { Session, User } from "better-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { loadAvatar } from "@/lib/avatar-utils";
import { cn } from "@/lib/utils";
import { ThemeModeToggle } from "./theme-toggle";
import { Skeleton } from "./ui/skeleton";

type SessionType = {
	user: User;
	session: Session;
};

interface UserDropdownProps {
	className?: string;
}

export function UserDropdown({ className }: UserDropdownProps) {
	const [session, setSession] = useState<SessionType | null>(null);
	const [sessionLoading, setSessionLoading] = useState<boolean>(true);
	const router = useRouter();

	useEffect(() => {
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
	}, []);

	const handleLogout = async () => {
		setSessionLoading(true);
		await authClient.signOut();
		router.push("/");
		setSession(null);
		setSessionLoading(false);
	};

	if (sessionLoading) {
		return <Skeleton className="size-10 rounded-full" />;
	}

	const avatarData = loadAvatar(session?.user!);

	return (
		<>
			{session ? (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Avatar className={cn("size-10 border", className)}>
							<AvatarImage src={avatarData.image} />
							<AvatarFallback className="cursor-pointer">
								{avatarData.initials}
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-52 rounded-2xl border border-primary/10"
						align="end"
						side="bottom"
					>
						<DropdownMenuLabel className="flex items-center gap-3">
							<Avatar className="size-8 border">
								<AvatarImage src={avatarData.image} />
								<AvatarFallback className="cursor-pointer">
									{avatarData.initials}
								</AvatarFallback>
							</Avatar>
							<div className="text-sm font-medium flex flex-col">
								<span>{session.user?.name}</span>
								<span className="text-xs text-muted-foreground">
									{session.user?.email}
								</span>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup className="flex flex-col gap-1">
							<DropdownMenuItem className="rounded-lg">
								Settings
							</DropdownMenuItem>
							<ThemeModeToggle />
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleLogout}
							className="rounded-xl"
						>
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<Link href="/sign-in">
					<Button className="rounded-full">Sign In</Button>
				</Link>
			)}
		</>
	);
}
