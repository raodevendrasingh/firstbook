import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { chat, resource } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST() {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return Response.json(
				{ success: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const notebookId = randomUUID();

		await db.insert(chat).values({
			id: notebookId,
			userId: session.user.id,
			title: "Untitled Notebook",
			createdAt: new Date(),
		});

		return Response.json(
			{
				success: true,
				message: "New Notebook Created",
				notebookId: notebookId,
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return Response.json(
			{ success: false, error: errorMessage },
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
				{ success: false, error: "Unauthorized" },
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
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return Response.json(
			{ success: false, error: errorMessage },
			{ status: 500 },
		);
	}
}
