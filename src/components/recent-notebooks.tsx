import { Dot, Plus } from "lucide-react";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { featuredNotebooks } from "@/data/notebooks";
import { Button } from "./ui/button";

export const RecentNotebooks = () => {
	return (
		<div className="flex flex-col items-center gap-3 pt-10">
			<div className="text-2xl font-medium w-full">Recent Notebooks</div>
			<div className="flex flex-row items-center justify-start flex-wrap gap-5 w-full">
				<Card className="flex items-center justify-center rounded-sm w-64 h-48 p-3">
					<CardContent className="flex flex-col items-center justify-center gap-4 px-3">
						<Button
							size="icon"
							variant="secondary"
							className="rounded-full size-16"
						>
							<Plus className="size-6" />
						</Button>
						<span className="font-medium text-xl">
							Create New Notebook
						</span>
					</CardContent>
				</Card>

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
