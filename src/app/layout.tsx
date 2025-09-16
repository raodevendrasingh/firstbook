import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/theme-provider";

const outfit = Outfit({
	variable: "--font-outfit",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "FirstbookLM",
	description:
		"An open, lightweight take on NotebookLM — focused on clarity, sources, and real-time context.",
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
	),
	openGraph: {
		title: "FirstbookLM",
		description:
			"An open, privacy-first take on NotebookLM — lightweight, source-driven, and fully self-hostable.",
		url: "/",
		siteName: "FirstbookLM",
		images: [
			{
				url: "/og.png",
				width: 1200,
				height: 630,
				alt: "FirstbookLM",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "FirstbookLM",
		description:
			"An open, lightweight take on NotebookLM — focused on clarity, sources, and real-time context.",
		images: ["/og.png"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
			</head>
			<body className={`${outfit.variable} font-sans antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
