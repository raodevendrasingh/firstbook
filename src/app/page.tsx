"use client";

import { FeaturedNotebooks } from "@/components/featured-notebooks";
import { Header } from "@/components/header";
import { RecentNotebooks } from "@/components/recent-notebooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
	return (
		<div className="flex flex-col">
			<Header />
			<div className="flex flex-col mt-20 min-h-[calc(100vh-5rem)] max-w-6xl w-full items-start justify-start mx-auto px-8">
				<div className="flex flex-col items-start justify-start w-full">
					<Tabs defaultValue="all" className="">
						<TabsList className="bg-transparent gap-2 border">
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="recents">
								My Notebooks
							</TabsTrigger>
							<TabsTrigger value="featured">Featured</TabsTrigger>
						</TabsList>
						<TabsContent value="all" className="flex flex-col">
							<FeaturedNotebooks />
							<RecentNotebooks />
						</TabsContent>
						<TabsContent value="recents">
							<RecentNotebooks />
						</TabsContent>
						<TabsContent value="featured">
							<FeaturedNotebooks />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
