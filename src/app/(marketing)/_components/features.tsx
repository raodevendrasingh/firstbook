import {
	KeyIcon,
	LightningIcon,
	MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const CardDecorator = ({ children }: { children: ReactNode }) => {
	return (
		<div className="relative mx-auto size-36 duration-200 transition-colors">
			<div
				aria-hidden
				className="absolute inset-0 group-hover:opacity-100 transition-opacity"
				style={{
					backgroundImage: `
						linear-gradient(to right, var(--border) 1px, transparent 1px),
						linear-gradient(to bottom, var(--border) 1px, transparent 1px)
					`,
					backgroundSize: "24px 24px",
					maskImage:
						"radial-gradient(circle at center, black 45%, transparent 70%)",
					WebkitMaskImage:
						"radial-gradient(circle at center, black 45%, transparent 70%)",
				}}
			/>

			<div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t-1 border-l-1 border-border shadow-sm transition-all duration-200">
				{children}
			</div>
		</div>
	);
};

export const Features = () => {
	const items = [
		{
			icon: (
				<MagnifyingGlassIcon
					className="size-6 text-primary"
					aria-hidden
				/>
			),
			title: "Smart Search",
			description:
				"Find exactly what you need with AI-powered search across all your sources.",
		},
		{
			icon: <KeyIcon className="size-6 text-primary" aria-hidden />,
			title: "Bring Your Own Keys",
			description:
				"Connect your own AI models and APIs. Keep complete control over your data and costs.",
		},
		{
			icon: <LightningIcon className="size-6 text-primary" aria-hidden />,
			title: "Open Source",
			description:
				"Fully open source and self-hostable. Customize, extend, and contribute to the project.",
		},
	];
	return (
		<section className="w-full px-4 py-24 bg-gradient-to-b from-muted/20 to-muted/10">
			<div className="@container max-w-7xl mx-auto w-full">
				<div className="text-center">
					<h2 className="text-balance text-4xl font-semibold lg:text-5xl">
						Built for modern research
					</h2>
					<p className="mt-4 text-muted-foreground text-lg">
						Everything you need to organize, analyze, and synthesize
						information from your sources.
					</p>
				</div>
				<Card className="bg-background rounded-3xl @min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 *:text-center md:mt-16">
					{items.map((item) => (
						<div
							className="group shadow-zinc-950/5 pb-8"
							key={`feature-${item.title}`}
						>
							<CardHeader className="pb-3">
								<CardDecorator>{item.icon}</CardDecorator>

								<h3 className="mt-6 font-semibold text-xl">
									{item.title}
								</h3>
							</CardHeader>

							<CardContent>
								<p className="text-sm text-muted-foreground">
									{item.description}
								</p>
							</CardContent>
						</div>
					))}
				</Card>
			</div>
		</section>
	);
};
