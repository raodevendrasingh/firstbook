"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 3,
						gcTime: 1000 * 60 * 5,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV !== "production" ? (
				<ReactQueryDevtools initialIsOpen={false} />
			) : null}
		</QueryClientProvider>
	);
}
