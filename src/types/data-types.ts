import type { Session, User } from "better-auth";

export interface UserSession {
	user: User;
	session: Session;
}

export type notebooksWithCounts = {
	resourceCount: number;
	id: string;
	createdAt: Date;
	title: string;
	userId: string;
};

export interface ModelConfig {
	openaiKey?: string;
	anthropicKey?: string;
	googleKey?: string;
}
export interface Keys {
	openaiKey?: string;
	anthropicKey?: string;
	googleKey?: string;
	exaKey?: string;
}

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

export type SafeKeys = {
	id: string;
	provider: "exa" | "openai" | "gemini" | "anthropic" | "r2";
	createdAt: Date;
	updatedAt: Date;
	hasKey: boolean;
};

export interface FileData {
	name: string;
	size: number;
	type: string;
	data: string;
}

export type ResourceMetadata = {
	inputMethod?: "raw_text";
	textLength?: number;
	url?: string;
	title?: string;
	extractedTextLength?: number;
	publishedDate?: string;
	contentLength?: number;
	summaryLength?: number;
	fileName?: string;
	fileSize?: number;
	mimeType?: string;
	hasTextContent?: boolean;
};
