"use client";

import { CTA } from "./_components/cta";
import { FAQs } from "./_components/faqs";
import { Features } from "./_components/features";
import { Footer } from "./_components/footer";
import { Header } from "./_components/header";
import HeroSection from "./_components/hero";

export default function Marketing() {
	return (
		<main className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/10 overflow-x-hidden">
			<Header />
			<HeroSection />
			<Features />
			<FAQs />
			<CTA />
			<Footer />
		</main>
	);
}
