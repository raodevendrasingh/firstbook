import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { providerEnum } from "@/db/schema/keys";
import {
	deleteApiKey,
	getAllApiKeys,
	storeApiKey,
	updateApiKey,
} from "@/lib/api-keys";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types/api-handler";
import type { SafeKeys } from "@/types/data-types";

type Provider = (typeof providerEnum.enumValues)[number];

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

		const keys = await getAllApiKeys(session.user.id);

		const safeKeys = keys.map((key) => ({
			id: key.id,
			provider: key.provider,
			createdAt: key.createdAt,
			updatedAt: key.updatedAt,
			hasKey: true,
		}));

		return Response.json(
			{
				success: true,
				message: "Keys fetched",
				data: {
					keys: safeKeys,
				},
			} satisfies ApiResponse<{ keys: SafeKeys[] }>,
			{ status: 200 },
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

export async function POST(request: NextRequest) {
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

		const { provider, apiKey } = await request.json();

		if (!provider || !apiKey) {
			return Response.json(
				{
					success: false,
					error: "Provider and API key are required",
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		if (!providerEnum.enumValues.includes(provider)) {
			return Response.json(
				{
					success: false,
					error: "Invalid provider",
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		const keyId = await storeApiKey(
			session.user.id,
			provider as Provider,
			apiKey,
		);

		return Response.json(
			{
				success: true,
				message: `${provider} API key stored successfully`,
				data: {
					keyId,
				},
			} satisfies ApiResponse<{ keyId: string }>,
			{ status: 200 },
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

export async function PUT(request: NextRequest) {
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

		const { keyId, apiKey } = await request.json();

		if (!keyId || !apiKey) {
			return Response.json(
				{
					success: false,
					error: "Key ID and API key are required",
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		const success = await updateApiKey(keyId, session.user.id, apiKey);

		if (!success) {
			return Response.json(
				{
					success: false,
					error: "Failed to update API key",
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		return Response.json(
			{
				success: true,
				message: "API key updated successfully",
				data: {
					keyId,
				},
			} satisfies ApiResponse<{ keyId: string }>,
			{ status: 200 },
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

export async function DELETE(request: NextRequest) {
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

		const { searchParams } = new URL(request.url);
		const keyId = searchParams.get("keyId");

		if (!keyId) {
			return Response.json(
				{
					success: false,
					error: "Key ID is required",
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		const success = await deleteApiKey(keyId, session.user.id);

		if (!success) {
			return Response.json(
				{
					success: false,
					error: "Failed to delete API key",
				} satisfies ApiResponse,
				{ status: 400 },
			);
		}

		return Response.json(
			{
				success: true,
				message: "API key deleted successfully",
				data: {
					keyId,
				},
			} satisfies ApiResponse<{ keyId: string }>,
			{ status: 200 },
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
