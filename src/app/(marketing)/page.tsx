import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Marketing() {
	return (
		<div className="flex flex-col items-center justify-center h-svh">
			<Link href="/notebooks">
				<Button>Get Started</Button>
			</Link>
		</div>
	);
}
