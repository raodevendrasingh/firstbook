"use client";

import { Header } from "@/components/header";
import { RecentNotebooks } from "@/components/recent-notebooks";

export default function Notebooks() {
	return (
		<div className="flex flex-col">
			<Header />
			<div className="flex flex-col mt-20 min-h-[calc(100vh-5rem)] pb-10 max-w-6xl w-full items-start justify-start mx-auto px-8">
				<div className="flex flex-col items-start justify-start w-full">
					<RecentNotebooks />
				</div>
			</div>
		</div>
	);
}
