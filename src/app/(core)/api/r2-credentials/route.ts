import { headers } from "next/headers";
import {
	deleteR2Credentials,
	getR2CredentialMeta,
	type R2Credentials,
	storeR2Credentials,
} from "@/lib/api-keys";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types/api-handler";

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

		const meta = await getR2CredentialMeta(session.user.id);

		const safe = meta
			? {
					id: meta.id,
					provider: "r2" as const,
					createdAt: meta.createdAt,
					updatedAt: meta.updatedAt,
					hasCredentials: true as const,
				}
			: null;

		return Response.json({
			success: true,
			message: "R2 credentials fetched",
			data: { credentials: safe },
		} satisfies ApiResponse<{
			credentials: {
				id: string;
				provider: "r2";
				createdAt: Date;
				updatedAt: Date;
				hasCredentials: true;
			} | null;
		}>);
	} catch (error) {
		return Response.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch R2 credentials",
			} satisfies ApiResponse,
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
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

		const credentials: R2Credentials = await request.json();

		// Validate required fields
		if (
			!credentials.endpoint ||
			!credentials.accessKeyId ||
			!credentials.secretAccessKey ||
			!credentials.publicAccessUrl ||
			!credentials.bucket
		) {
			return Response.json(
				{
					success: false,
					error: "All R2 credential fields are required",
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		await storeR2Credentials(session.user.id, credentials);

		return Response.json({
			success: true,
			message: "R2 credentials saved successfully",
		} satisfies ApiResponse);
	} catch (error) {
		return Response.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to save R2 credentials",
			} satisfies ApiResponse,
			{ status: 500 },
		);
	}
}

export async function DELETE() {
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

		await deleteR2Credentials(session.user.id);

		return Response.json({
			success: true,
			message: "R2 credentials deleted successfully",
		} satisfies ApiResponse);
	} catch (error) {
		return Response.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to delete R2 credentials",
			} satisfies ApiResponse,
			{ status: 500 },
		);
	}
}
