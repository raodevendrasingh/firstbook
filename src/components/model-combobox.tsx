"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Drawer,
	DrawerContent,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useMediaQuery } from "@/hooks/use-media-query";

type Model = {
	value: string;
	label: string;
};

interface ModelComboboxProps {
	models: string[];
	selectedModel: string;
	onModelChange: (model: string) => void;
	disabled?: boolean;
	className?: string;
}

export function ModelCombobox({
	models,
	selectedModel,
	onModelChange,
	disabled = false,
	className,
}: ModelComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const modelOptions: Model[] = models.map((model) => ({
		value: model,
		label: model,
	}));

	const selectedModelOption = modelOptions.find(
		(model) => model.value === selectedModel,
	);

	if (isDesktop) {
		return (
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={`justify-between rounded-full ${className}`}
						disabled={disabled}
					>
						{selectedModelOption ? (
							<span className="truncate">
								{selectedModelOption.label}
							</span>
						) : (
							<span>Select model...</span>
						)}
						<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-56 p-0 rounded-none md:rounded-xl bg-background"
					align="start"
				>
					<ModelList
						models={modelOptions}
						setOpen={setOpen}
						onModelChange={onModelChange}
					/>
				</PopoverContent>
			</Popover>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTitle className="sr-only">Select model</DrawerTitle>
			<DrawerTrigger asChild>
				<Button
					variant="outline"
					className={`justify-between rounded-full ${className}`}
					disabled={disabled}
				>
					{selectedModelOption ? (
						<span className="truncate">
							{selectedModelOption.label}
						</span>
					) : (
						<span>Select model...</span>
					)}
					<ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<div className="mt-4 border-t">
					<ModelList
						models={modelOptions}
						setOpen={setOpen}
						onModelChange={onModelChange}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

function ModelList({
	models,
	setOpen,
	onModelChange,
}: {
	models: Model[];
	setOpen: (open: boolean) => void;
	onModelChange: (model: string) => void;
}) {
	return (
		<Command className="rounded-none md:rounded-xl bg-transparent md:bg-accent/50">
			<CommandInput placeholder="Search models..." />
			<CommandList>
				<CommandEmpty>No models found.</CommandEmpty>
				<CommandGroup>
					{models.map((model) => (
						<CommandItem
							className="rounded-lg"
							key={model.value}
							value={model.value}
							onSelect={(value) => {
								const selectedModel = models.find(
									(m) => m.value === value,
								);
								if (selectedModel) {
									onModelChange(selectedModel.value);
								}
								setOpen(false);
							}}
						>
							{model.label}
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
