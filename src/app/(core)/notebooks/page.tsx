"use client";

import Image from "next/image";
import logo from "@/assets/brand/firstbook_logo.svg";
import { RecentNotebooks } from "@/components/recent-notebooks";
import { UserDropdown } from "@/components/user-dropdown";

export default function Notebooks() {
	return (
		<div className="flex flex-col">
			<header className="fixed flex items-center h-16 w-full px-8 border-b z-50">
				<div className="flex w-full items-center justify-between max-w-7xl mx-auto">
					<div className="flex items-center gap-2">
						<Image
							src={logo}
							alt="FirstbookLM"
							width={32}
							height={32}
						/>
						<span className="font-semibold text-2xl">
							FirstbookLM
						</span>
					</div>
					<UserDropdown />
				</div>
			</header>
			<div className="flex flex-col mt-20 min-h-[calc(100vh-5rem)] pb-10 max-w-6xl w-full items-start justify-start mx-auto px-8">
				<div className="flex flex-col items-start justify-start w-full">
					<RecentNotebooks />
				</div>
			</div>
		</div>
	);
}
