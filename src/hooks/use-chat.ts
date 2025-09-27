import { useQuery } from "@tanstack/react-query";
import type { FetchChatResponse } from "@/types/api-handler";

export const chatKeys = {
	all: ["chat"] as const,
	chat: (chatId: string) => [...chatKeys.all, chatId] as const,
};

export function useFetchChat(chatId: string) {
	return useQuery({
		queryKey: chatKeys.chat(chatId),
		queryFn: async (): Promise<FetchChatResponse> => {
			const response = await fetch(`/api/chat?chatId=${chatId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch chat");
			}
			return response.json();
		},
		staleTime: 1000 * 30,
	});
}
