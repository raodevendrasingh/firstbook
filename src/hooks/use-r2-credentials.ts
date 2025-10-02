import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { R2Credentials } from "@/lib/api-keys";

const R2_CREDENTIALS_QUERY_KEY = "r2-credentials";

export function useFetchR2Credentials() {
	return useQuery({
		queryKey: [R2_CREDENTIALS_QUERY_KEY],
		queryFn: async () => {
			const response = await fetch("/api/r2-credentials");
			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || "Failed to fetch R2 credentials");
			}

			return data.data.credentials as R2Credentials | null;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useStoreR2Credentials() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (credentials: R2Credentials) => {
			const response = await fetch("/api/r2-credentials", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(credentials),
			});

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || "Failed to save R2 credentials");
			}

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [R2_CREDENTIALS_QUERY_KEY],
			});
		},
	});
}

export function useDeleteR2Credentials() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/r2-credentials", {
				method: "DELETE",
			});

			const data = await response.json();

			if (!data.success) {
				throw new Error(
					data.error || "Failed to delete R2 credentials",
				);
			}

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [R2_CREDENTIALS_QUERY_KEY],
			});
		},
	});
}
