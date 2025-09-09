import type { UIMessage } from "ai";

export type notebooksWithCounts = {
	resourceCount: number;
	id: string;
	createdAt: Date;
	title: string;
	userId: string;
};

export type ApiResponse<T = undefined> =
	| {
			success: true;
			message: string;
			data?: T;
	  }
	| { success: false; error: string };

export type CreateNotebookResponse =
	| {
			success: true;
			message: string;
			data: {
				notebookId: string;
			};
	  }
	| { success: false; error: string };

export type FetchNotebooksResponse =
	| {
			success: true;
			message: string;
			data: {
				notebooks: notebooksWithCounts[];
			};
	  }
	| { success: false; error: string };

export type FetchChatResponse =
	| {
			success: true;
			message: string;
			data: {
				messages: UIMessage[];
				title: string;
			};
	  }
	| { success: false; error: string };

export type DeleteNotebookResponse =
	| {
			success: true;
			message: string;
	  }
	| { success: false; error: string };

export type ExaSearchResponse = {
	requestId: string;
	results: SearchResult[];
	statuses?: SearchStatus[];
	costDollars?: CostDollars;
	searchTime?: number;
	context?: string;
	autopromptString?: string;
	autoDate?: string;
};

export type SearchResult = {
	title: string | null;
	url: string;
	publishedDate?: string;
	author?: string;
	score?: number;
	id: string;
	image?: string;
	favicon?: string;
	text?: string | null;
};

export type SearchStatus = {
	id: string;
	status: string;
	source: string;
};

export type CostDollars = {
	total: number;
	search?: unknown;
	contents?: {
		text?: number;
		highlights?: number;
		summary?: number;
	};
};
