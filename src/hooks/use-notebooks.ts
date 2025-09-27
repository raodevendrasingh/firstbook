import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/api-handler";
import type { notebooksWithCounts } from "@/types/data-types";

export const notebooksKeys = {
	all: ["notebooks"] as const,
};

export function useFetchNotebooks() {
	return useQuery({
		queryKey: notebooksKeys.all,
		queryFn: async (): Promise<
			ApiResponse<{ notebooks: notebooksWithCounts[] }>
		> => {
			const response = await fetch("/api/notebook");
			if (!response.ok) {
				throw new Error("Failed to fetch notebooks");
			}
			if (response.status === 204 || response.status === 205) {
				return {
					success: true,
					message: "No notebooks found",
					data: {
						notebooks: [],
					},
				};
			}

			return response.json();
		},
		staleTime: 1000 * 30,
	});
}

export function useCreateNotebook() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/notebook", {
				method: "POST",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create notebook");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notebooksKeys.all });
		},
	});
}

export function useDeleteNotebook() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (notebookId: string) => {
			const response = await fetch(
				`/api/notebook?notebookId=${notebookId}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete notebook");
			}
			if (response.status === 204 || response.status === 205) {
				return {
					success: true,
					message: "Notebook deleted",
				};
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: notebooksKeys.all });
		},
	});
}
