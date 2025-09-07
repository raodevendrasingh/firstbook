"use client";

import type { Session, User } from "better-auth";
import Link from "next/link";
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
import { Skeleton } from "./ui/skeleton";

type SessionType = {
	user: User;
	session: Session;
};

export function UserDropdown() {
	const [session, setSession] = useState<SessionType | null>(null);
	const [sessionLoading, setSessionLoading] = useState<boolean>(true);

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
						<Avatar className="size-10 border">
							<AvatarImage src={avatarData.image} />
							<AvatarFallback className="cursor-pointer">
								{avatarData.initials}
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-52"
						align="center"
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
						<DropdownMenuGroup>
							<DropdownMenuItem>Settings</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<Link href="/sign-in">
					<Button>Sign In</Button>
				</Link>
			)}
		</>
	);
}
