"use client";

import { UserDropdown } from "./user-dropdown";

export const Header = () => {
	return (
		<nav className="fixed flex items-center h-16 w-full px-8 bg-primary-foreground">
			<div className="flex w-full items-center justify-between max-w-7xl mx-auto">
				<span className="text-3xl font-semibold">FirstbookLM</span>
				<UserDropdown />
			</div>
		</nav>
	);
};
