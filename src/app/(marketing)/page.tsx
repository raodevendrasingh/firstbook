"use client";

import {
	BookOpen,
	CopyrightIcon,
	KeyRound,
	Search,
	Sparkles,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/firstbook_logo.svg";
import { GithubIcon } from "@/assets/icons/github";
import { Button } from "@/components/ui/button";

export default function Marketing() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-x-hidden">
			<header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
				<div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
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
					<div className="flex items-center gap-4">
						<Link href="/sign-in">
							<Button variant="ghost" className="rounded-full">
								Sign In
							</Button>
						</Link>
						<Link href="/sign-up">
							<Button className="rounded-full">
								Get Started
							</Button>
						</Link>
					</div>
				</div>
			</header>

			<section className="container mx-auto px-12 md:px-8 py-24 relative">
				<div className="max-w-4xl mx-auto text-center">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 shadow-sm">
						<Sparkles className="h-4 w-4" />
						Open Source • BYOK
					</div>
					<h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
						Your lightweight{" "}
						<span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
							NotebookLM
						</span>{" "}
						alternative
					</h1>
					<p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
						Transform your research and writing with AI-powered
						note-taking. Bring your own API keys and take control of
						your data while creating intelligent notebooks.
					</p>
					<div className="flex flex-col sm:flex-row gap-6 justify-center">
						<Link
							href="https://github.com/raodevendrasingh/firstbook"
							target="_blank"
						>
							<Button
								size="lg"
								className="w-full sm:w-auto rounded-xl px-8 py-4 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90"
							>
								View on GitHub
								<GithubIcon />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			<section className="container mx-auto px-4 py-24 bg-gradient-to-b from-muted/20 to-muted/10">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
							Built for modern research
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
							Everything you need to organize, analyze, and
							synthesize information from your sources.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="group text-center p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
							<div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
								<Search className="h-8 w-8 text-primary" />
							</div>
							<h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">
								Smart Search
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Find exactly what you need with AI-powered
								search across all your sources.
							</p>
						</div>

						<div className="group text-center p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
							<div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
								<KeyRound className="h-8 w-8 text-primary" />
							</div>
							<h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">
								Bring Your Own Keys
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Connect your own AI models and APIs. Keep
								complete control over your data and costs.
							</p>
						</div>

						<div className="group text-center p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
							<div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
								<Zap className="h-8 w-8 text-primary" />
							</div>
							<h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">
								Open Source
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								Fully open source and self-hostable. Customize,
								extend, and contribute to the project.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="container mx-auto px-4 py-24 relative">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
						Ready to get started?
					</h2>
					<p className="text-xl text-muted-foreground mb-12 leading-relaxed">
						Join the growing community of researchers and writers
						who are taking control of their AI-powered note-taking.
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

			<footer className="border-t border-border/40 bg-gradient-to-t from-muted/20 to-transparent">
				<div className="max-w-7xl mx-auto px-4 py-6">
					<div className="flex flex-col md:flex-row items-center justify-between">
						<div className="flex items-center gap-3 mb-6 md:mb-0">
							<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
								<BookOpen className="h-5 w-5 text-primary" />
							</div>
							<span className="font-semibold text-2xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
								FirstbookLM
							</span>
						</div>
						<div className="flex items-center gap-3">
							<CopyrightIcon className="size-4 text-muted-foreground" />
							<span className="text-base text-muted-foreground font-light">
								{new Date().getFullYear()} FirstbookLM. OSS.
							</span>
						</div>
					</div>
				</div>
			</footer>
		</main>
	);
}
