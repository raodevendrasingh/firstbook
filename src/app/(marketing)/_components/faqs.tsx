"use client";

import Link from "next/link";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQs = () => {
	const faqItems = [
		{
			id: "item-1",
			question: "Is FirstbookLM self-hostable?",
			answer: "Absolutely! FirstbookLM is built with self-hosting as a core principle. This is the primary reason we don't offer a traditional pricing plan – we believe your data and research should remain entirely under your control. Deploy it on your own infrastructure and maintain complete privacy over your notebooks and sources.",
		},
		{
			id: "item-2",
			question: "I don't know how to self-host. Can you help?",
			answer: "We've made self-hosting as straightforward as possible! Please refer to the README on our GitHub repository for detailed setup instructions, including environment configuration, database setup, and deployment options.",
		},
		{
			id: "item-3",
			question: "Why not offer a managed service?",
			answer: "Privacy and control are at the heart of FirstbookLM. By avoiding a managed service model, we ensure your research, notes, and AI interactions remain completely private. There's no middleman, no data collection, and no vendor lock-in. You own your infrastructure, your data, and your AI keys — exactly as it should be.",
		},
		{
			id: "item-4",
			question: "How does the BYOK (Bring Your Own Key) model work?",
			answer: "BYOK means you connect your own API keys from providers like OpenAI, Anthropic, or Google directly to FirstbookLM. This eliminates any middleman, gives you full control over costs, and ensures your AI interactions go directly to your chosen provider. Your keys, your data, your control.",
		},
	];

	return (
		<section className="py-16 md:py-24">
			<div className="mx-auto max-w-7xl px-4 md:px-6">
				<div className="mx-auto max-w-xl text-center">
					<h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
						Frequently Asked Questions
					</h2>
					<p className="text-muted-foreground mt-4 text-balance">
						Discover quick and comprehensive answers to common
						questions about our platform, services, and features.
					</p>
				</div>

				<div className="mx-auto mt-12 max-w-xl">
					<Accordion
						type="single"
						collapsible
						className="bg-muted dark:bg-muted/50 w-full rounded-2xl p-1"
					>
						{faqItems.map((item) => (
							<div className="group" key={item.id}>
								<AccordionItem
									value={item.id}
									className="data-[state=open]:bg-card dark:data-[state=open]:bg-muted peer rounded-xl border-none px-7 py-1 data-[state=open]:border-none data-[state=open]:shadow-sm"
								>
									<AccordionTrigger className="cursor-pointer text-base hover:no-underline">
										{item.question}
									</AccordionTrigger>
									<AccordionContent>
										<p className="text-base">
											{item.answer}
										</p>
									</AccordionContent>
								</AccordionItem>
								<hr className="mx-7 border-border group-last:hidden peer-data-[state=open]:opacity-0" />
							</div>
						))}
					</Accordion>

					<p className="text-muted-foreground mt-6 px-8">
						Can't find what you're looking for? Check out our{" "}
						<Link
							href="https://github.com/raodevendrasingh/firstbook"
							target="_blank"
							className="text-primary font-medium hover:underline"
						>
							GitHub repository
						</Link>
					</p>
				</div>
			</div>
		</section>
	);
};
