import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/types/api-handler";
import type { SafeKeys } from "@/types/data-types";

// Query key factory
export const keysKeys = {
	all: ["keys"] as const,
};

export function useFetchKeys() {
	return useQuery({
		queryKey: keysKeys.all,
		queryFn: async (): Promise<ApiResponse<{ keys: SafeKeys[] }>> => {
			const response = await fetch("/api/keys");
			if (!response.ok) {
				throw new Error("Failed to fetch API keys");
			}
			return response.json();
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
}

export function useStoreKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			provider,
			apiKey,
		}: {
			provider: string;
			apiKey: string;
		}) => {
			const response = await fetch("/api/keys", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ provider, apiKey }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to store API key");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: keysKeys.all });
		},
	});
}

export function useUpdateKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			keyId,
			apiKey,
		}: {
			keyId: string;
			apiKey: string;
		}) => {
			const response = await fetch("/api/keys", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ keyId, apiKey }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update API key");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: keysKeys.all });
		},
	});
}

export function useDeleteKey() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (keyId: string) => {
			const response = await fetch(`/api/keys?keyId=${keyId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to delete API key");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: keysKeys.all });
		},
	});
}
