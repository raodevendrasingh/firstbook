import type { UIMessage } from "ai";
import type { Resource } from "@/db/schema";
import type { notebooksWithCounts, SafeKeys } from "./data-types";

export type ApiResponse<T = undefined> =
	| {
			success: true;
			message: string;
			data?: T;
	  }
	| {
			success: false;
			error: string;
			requiresSetup?: boolean;
	  };

export type CreateNotebookResponse = ApiResponse<{ notebookId: string }>;

export type FetchNotebooksResponse = ApiResponse<{
	notebooks: notebooksWithCounts[];
}>;

export type FetchChatResponse = ApiResponse<{
	messages: UIMessage[];
	title: string;
	summary: string;
}>;

export type SourceFetchResponse = ApiResponse<{ resource: Resource[] }>;

export type FetchApiKeysResponse = ApiResponse<{
	keys: SafeKeys[];
}>;
