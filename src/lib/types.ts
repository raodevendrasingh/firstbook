import type { UIMessage } from "ai";

export type notebooksWithCounts = {
	resourceCount: number;
	id: string;
	createdAt: Date;
	title: string;
	userId: string;
};

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
