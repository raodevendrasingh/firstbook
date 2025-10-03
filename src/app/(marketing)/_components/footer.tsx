import { CopyrightIcon } from "@phosphor-icons/react";
import Image from "next/image";
import logo from "@/assets/brand/firstbook_logo.svg";

export const Footer = () => {
	return (
		<footer className="border-t border-border/40 bg-gradient-to-t from-muted/20 to-transparent">
			<div className="max-w-7xl mx-auto px-4 py-6">
				<div className="flex flex-col gap-3 md:flex-row items-center justify-between">
					<div className="flex items-center gap-2">
						<Image
							src={logo}
							alt="FirstbookLM"
							width={32}
							height={32}
						/>
						<span className="font-semibold text-xl md:text-2xl">
							FirstbookLM
						</span>
					</div>
					<div className="flex items-center gap-2">
						<CopyrightIcon className="size-4 text-muted-foreground" />
						<span className="text-base text-muted-foreground font-light">
							{new Date().getFullYear()} FirstbookLM. OSS.
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
};
