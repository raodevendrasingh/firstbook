import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/lib/env";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const figtree = Figtree({
	variable: "--font-figtree",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "FirstbookLM",
	description:
		"An open, lightweight take on NotebookLM — focused on clarity, sources, and real-time context.",
	metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "FirstbookLM",
		description:
			"An open, privacy-first take on NotebookLM — lightweight, source-driven, and fully self-hostable.",
		url: "/",
		siteName: "FirstbookLM",
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "FirstbookLM",
		description:
			"An open, lightweight take on NotebookLM — focused on clarity, sources, and real-time context.",
	},
	icons: {
		icon: [
			{ url: "/favicon-16x16.png", sizes: "16x16" },
			{ url: "/favicon-32x32.png", sizes: "32x32" },
		],
		apple: "/apple-touch-icon.png",
	},
	manifest: "/site.webmanifest",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${figtree.variable} font-sans antialiased`}>
				<QueryProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{children}
						<Toaster />
					</ThemeProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
