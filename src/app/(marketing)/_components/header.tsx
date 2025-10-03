import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/firstbook_logo.svg";
import { Button } from "@/components/ui/button";

export const Header = () => {
	return (
		<header className="fixed top-0 md:top-1.5 rounded-none md:rounded-3xl md:max-w-7xl mx-auto border left-0 right-0 border-b border-border bg-background/60 backdrop-blur-lg z-50">
			<div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Image
						src={logo}
						alt="FirstbookLM"
						width={32}
						height={32}
					/>
					<span className="font-semibold text-2xl">FirstbookLM</span>
				</div>
				<div className="flex items-center gap-4">
					<Link href="/sign-in">
						<Button variant="ghost" className="rounded-full">
							Sign In
						</Button>
					</Link>
					<Link href="/sign-up" className="hidden md:block">
						<Button className="rounded-full">Get Started</Button>
					</Link>
				</div>
			</div>
		</header>
	);
};
