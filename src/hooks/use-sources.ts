import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Resource } from "@/db/schema";
import type { ApiResponse } from "@/types/api-handler";
import { chatKeys } from "./use-chat";

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
				files?: {
					name: string;
					size: number;
					type: string;
					data: string;
				}[];
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
			// Invalidate both sources and chat queries since adding sources
			// also updates the chat with a unified summary
			queryClient.invalidateQueries({
				queryKey: sourcesKeys.sources(variables.chatId),
			});
			queryClient.invalidateQueries({
				queryKey: chatKeys.chat(variables.chatId),
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
		onMutate: async ({ chatId, id }) => {
			await queryClient.cancelQueries({
				queryKey: sourcesKeys.sources(chatId),
			});

			const previousSources = queryClient.getQueryData(
				sourcesKeys.sources(chatId),
			);

			queryClient.setQueryData(
				sourcesKeys.sources(chatId),
				(old: unknown) => {
					const oldData = old as
						| ApiResponse<{ resource: Resource[] }>
						| undefined;
					if (!oldData?.success || !oldData?.data?.resource)
						return old;
					return {
						...oldData,
						data: {
							...oldData.data,
							resource: oldData.data.resource.filter(
								(r: Resource) => r.id !== id,
							),
						},
					};
				},
			);

			return { previousSources };
		},
		onError: (err, variables, context) => {
			if (context?.previousSources) {
				queryClient.setQueryData(
					sourcesKeys.sources(variables.chatId),
					context.previousSources,
				);
			}
		},
		onSuccess: (_, variables) => {
			// Invalidate both sources and chat queries since deleting sources
			// may also update the chat's unified summary
			queryClient.invalidateQueries({
				queryKey: sourcesKeys.sources(variables.chatId),
			});
			queryClient.invalidateQueries({
				queryKey: chatKeys.chat(variables.chatId),
			});
		},
	});
}
