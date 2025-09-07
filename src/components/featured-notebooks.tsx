import { Dot } from "lucide-react";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { featuredNotebooks } from "@/data/notebooks";

export const FeaturedNotebooks = () => {
	return (
		<div className="flex flex-col items-center gap-3 pt-10">
			<div className="text-2xl font-medium w-full">
				Featured Notebooks
			</div>
			<div className="flex flex-row items-center justify-start flex-wrap gap-5 w-full">
				{featuredNotebooks.map((nb) => (
					<Link key={nb.id} href={nb.href}>
						<Card className="rounded-sm w-64 h-48">
							<CardHeader>
								<CardTitle>{nb.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<p>{nb.author}</p>
							</CardContent>
							<CardFooter className="flex items-center text-sm font-light">
								<p>{nb.createdAt}</p>
								<Dot />
								<p>{nb.sources} Sources</p>
							</CardFooter>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
};
