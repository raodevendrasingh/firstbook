import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Resource } from "@/db/schema";
import type { ApiResponse } from "@/types/api-handler";

export const sourcesKeys = {
	all: ["sources"] as const,
	sources: (chatId: string) => [...sourcesKeys.all, chatId] as const,
};

export function useFetchSources(chatId: string) {
	return useQuery({
		queryKey: sourcesKeys.sources(chatId),
		queryFn: async (): Promise<ApiResponse<{ resource: Resource[] }>> => {
			const response = await fetch(`/api/source?chatId=${chatId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch sources");
			}
			return response.json();
		},
		staleTime: 1000 * 30 * 5,
		enabled: !!chatId,
	});
}

export function useAddSources() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			type,
			data,
			chatId,
		}: {
			type: "files" | "links" | "text";
			data: {
				urls?: string[];
				files?: File[];
				text?: string;
			};
			chatId: string;
		}) => {
			const response = await fetch("/api/source", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ type, data, chatId }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to add sources");
			}

			return response.json();
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: sourcesKeys.sources(variables.chatId),
			});
		},
	});
}

export function useDeleteSource() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ chatId, id }: { chatId: string; id: string }) => {
			const response = await fetch(
				`/api/source?chatId=${chatId}&id=${id}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete source");
			}

			const bodyText = (await response.text()).trim();
			return bodyText.length > 0 ? JSON.parse(bodyText) : undefined;
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: sourcesKeys.sources(variables.chatId),
			});
		},
	});
}
