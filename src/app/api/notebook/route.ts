import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { chat, message, resource } from "@/db/schema";
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

export async function DELETE(req: Request) {
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

		const { searchParams } = new URL(req.url);
		const notebookId = searchParams.get("notebookId");

		if (!notebookId) {
			return Response.json(
				{ success: false, error: "Notebook ID is required" },
				{ status: 400 },
			);
		}

		// Verify the notebook belongs to the user
		const notebook = await db
			.select()
			.from(chat)
			.where(
				and(eq(chat.id, notebookId), eq(chat.userId, session.user.id)),
			);

		if (!notebook.length) {
			return Response.json(
				{ success: false, error: "Notebook not found" },
				{ status: 404 },
			);
		}

		// Delete all related messages first
		await db.delete(message).where(eq(message.chatId, notebookId));

		// Delete all related resources
		await db.delete(resource).where(eq(resource.chatId, notebookId));

		// Delete the notebook
		await db.delete(chat).where(eq(chat.id, notebookId));

		return Response.json(
			{
				success: true,
				message: "Notebook deleted successfully",
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
