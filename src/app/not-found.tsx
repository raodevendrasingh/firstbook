"use client";

import { ArrowLeftIcon, HouseIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	const router = useRouter();

	const handleGoBack = () => {
		if (window.history.length > 1) {
			router.back();
		} else {
			router.push("/");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/10 px-4 relative">
			<div className="text-center space-y-8 max-w-md mx-auto relative z-10">
				<div className="space-y-4">
					<h1 className="text-8xl md:text-9xl font-bold text-foreground/20 select-none font-mono">
						404
					</h1>
					<div className="space-y-2">
						<h2 className="text-2xl md:text-3xl font-semibold text-foreground">
							Page Not Found :/
						</h2>
						<p className="text-muted-foreground text-sm md:text-base leading-relaxed">
							The page you're looking for doesn't exist or has
							been moved. Let's get you back on track.
						</p>
					</div>
				</div>

				<div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
					<Button
						onClick={handleGoBack}
						variant="outline"
						size="lg"
						className="shadow-sm rounded-full"
					>
						<ArrowLeftIcon className="size-4" />
						Go Back
					</Button>
					<Button
						asChild
						size="lg"
						className="shadow-sm rounded-full"
					>
						<Link href="/">
							<HouseIcon className="size-4" />
							Go Home
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
