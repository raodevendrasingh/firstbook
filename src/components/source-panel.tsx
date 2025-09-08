"use client";

import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type sourcePanelProps = {
	setSourceDialogOpen: (open: boolean) => void;
	className?: string;
};

export const SourcePanel = ({
	setSourceDialogOpen,
	className,
}: sourcePanelProps) => {
	return (
		<div
			className={cn(
				"relative flex flex-col md:max-w-xs lg:max-w-md h-[calc(100vh-7.3rem)] md:h-[calc(100vh-4.5rem)] bg-background border border-border w-full rounded-md overflow-hidden",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-3 border-b px-3 py-1 bg-accent rounded-t-md">
				<div className="font-medium">Sources</div>
				<Button
					variant="default"
					size="sm"
					className="hidden md:flex rounded-full"
					onClick={() => setSourceDialogOpen(true)}
				>
					<PlusIcon className="size-4" />
					Add
				</Button>
			</div>
			<div className="relative flex flex-1 h-full min-h-0 flex-col gap-2 p-3 overflow-y-auto w-full">
				<Button
					variant="default"
					className="flex md:hidden rounded-full w-fit mx-auto mt-auto h-10 sticky bottom-16"
					onClick={() => setSourceDialogOpen(true)}
				>
					<PlusIcon className="size-4" />
					Add Sources
				</Button>
			</div>
		</div>
	);
};
