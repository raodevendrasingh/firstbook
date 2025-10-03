import Link from "next/link";
import { GithubIcon } from "@/assets/icons/github";
import { Button } from "@/components/ui/button";

export const CTA = () => {
	return (
		<section className="w-full px-4 py-24 relative bg-muted/20">
			<div className="max-w-7xl w-full mx-auto text-center px-8">
				<h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
					Ready to get started?
				</h2>
				<p className="text-xl text-muted-foreground mb-12 leading-relaxed">
					Join the growing community of researchers and writers who
					are taking control of their AI-powered note-taking.
				</p>
				<div className="flex flex-col sm:flex-row gap-6 justify-center">
					<Link
						href="https://github.com/raodevendrasingh/firstbook"
						target="_blank"
					>
						<Button
							size="lg"
							className="px-10 py-4 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 rounded-2xl"
						>
							Star on GitHub
							<GithubIcon />
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
};
