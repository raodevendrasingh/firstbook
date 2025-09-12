import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { chat, message, resource } from "@/db/schema";
import { auth } from "@/lib/auth";
import type { ApiResponse, notebooksWithCounts } from "@/lib/types";

export const revalidate = 60;

export async function POST() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return Response.json(
				{ success: false, error: "Unauthorized" } satisfies ApiResponse,
				{ status: 401 },
			);
		}

		const notebookId = randomUUID();

		await db.insert(chat).values({
			id: notebookId,
			userId: session.user.id,
			title: "",
			createdAt: new Date(),
		});

		return Response.json(
			{
				success: true,
				message: "New Notebook Created",
				data: {
					notebookId: notebookId,
				},
			} satisfies ApiResponse<{ notebookId: string }>,
			{
				status: 200,
			},
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return Response.json(
			{ success: false, error: errorMessage } satisfies ApiResponse,
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return Response.json(
				{ success: false, error: "Unauthorized" } satisfies ApiResponse,
				{ status: 401 },
			);
		}

		const notebooks = await db
			.select()
			.from(chat)
			.where(eq(chat.userId, session.user.id))
			.orderBy(desc(chat.createdAt));

		const notebookIds = notebooks.map((nb) => nb.id);

		const counts = notebookIds.length
			? await db
					.select({
						chatId: resource.chatId,
						resourceCount: sql<number>`count(${resource.id})`,
					})
					.from(resource)
					.where(
						and(
							eq(resource.userId, session.user.id),
							inArray(resource.chatId, notebookIds),
						),
					)
					.groupBy(resource.chatId)
			: ([] as Array<{ chatId: string; resourceCount: number }>);

		const countByChatId = Object.fromEntries(
			counts.map((c) => [c.chatId, Number(c.resourceCount)]),
		) as Record<string, number>;

		const notebooksWithCounts = notebooks.map((nb) => ({
			...nb,
			resourceCount: countByChatId[nb.id] ?? 0,
		}));

		return Response.json(
			{
				success: true,
				message: "Notebooks Fetched",
				data: {
					notebooks: notebooksWithCounts,
				},
			} satisfies ApiResponse<{ notebooks: notebooksWithCounts[] }>,
			{
				status: 200,
			},
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return Response.json(
			{ success: false, error: errorMessage } satisfies ApiResponse,
			{ status: 500 },
		);
	}
}

export async function DELETE(req: Request) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return Response.json(
				{ success: false, error: "Unauthorized" } satisfies ApiResponse,
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(req.url);
		const notebookId = searchParams.get("notebookId");

		if (!notebookId) {
			return Response.json(
				{
					success: false,
					error: "Notebook ID is required",
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		const notebook = await db
			.select()
			.from(chat)
			.where(
				and(eq(chat.id, notebookId), eq(chat.userId, session.user.id)),
			);

		if (!notebook.length) {
			return Response.json(
				{
					success: false,
					error: "Notebook not found",
				} satisfies ApiResponse,
				{ status: 404 },
			);
		}

		await db.transaction(async (tx) => {
			await tx.delete(message).where(eq(message.chatId, notebookId));
			await tx.delete(resource).where(eq(resource.chatId, notebookId));
			await tx.delete(chat).where(eq(chat.id, notebookId));
		});

		return Response.json(
			{
				success: true,
				message: "Notebook deleted successfully",
			} satisfies ApiResponse,
			{
				status: 200,
			},
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return Response.json(
			{ success: false, error: errorMessage } satisfies ApiResponse,
			{ status: 500 },
		);
	}
}
