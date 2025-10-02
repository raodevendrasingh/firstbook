import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { keys, type providerEnum } from "@/db/schema/keys";
import { decryptApiKey, encryptApiKey } from "./encryption";

const keyCache = new Map<string, string>();
const CACHE_TTL = 5 * 60 * 1000;
const cacheTimestamps = new Map<string, number>();

type Provider = (typeof providerEnum.enumValues)[number];

export interface ApiKeyData {
	id: string;
	provider: Provider;
	key: string;
	createdAt: Date;
	updatedAt: Date;
}

export async function storeApiKey(
	userId: string,
	provider: Provider,
	apiKey: string,
): Promise<string> {
	try {
		const { ciphertext, iv, tag, salt } = await encryptApiKey(apiKey);

		const [result] = await db
			.insert(keys)
			.values({
				id: randomUUID(),
				userId,
				provider,
				keyCiphertext: ciphertext.toString("base64"),
				keyIv: Buffer.concat([salt, iv]).toString("base64"),
				keyTag: tag.toString("base64"),
				algo: "AES-256-GCM",
			})
			.returning({ id: keys.id });

		const cacheKey = `${userId}:${provider}`;
		keyCache.delete(cacheKey);
		cacheTimestamps.delete(cacheKey);

		return result.id;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to store API key: ${errorMessage}`);
	}
}

export async function getApiKey(
	userId: string,
	provider: Provider,
): Promise<string | null> {
	const cacheKey = `${userId}:${provider}`;
	const now = Date.now();

	if (keyCache.has(cacheKey)) {
		const cacheTime = cacheTimestamps.get(cacheKey) || 0;
		if (now - cacheTime < CACHE_TTL) {
			return keyCache.get(cacheKey)!;
		}
	}

	try {
		const [keyRecord] = await db
			.select()
			.from(keys)
			.where(and(eq(keys.userId, userId), eq(keys.provider, provider)))
			.limit(1);

		if (!keyRecord) {
			return null;
		}

		const keyIvBuffer = Buffer.from(keyRecord.keyIv, "base64");
		const salt = keyIvBuffer.subarray(0, 16);
		const iv = keyIvBuffer.subarray(16);

		const decryptedKey = await decryptApiKey(
			Buffer.from(keyRecord.keyCiphertext, "base64"),
			iv,
			Buffer.from(keyRecord.keyTag!, "base64"),
			salt,
		);

		keyCache.set(cacheKey, decryptedKey);
		cacheTimestamps.set(cacheKey, now);

		return decryptedKey;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to retrieve API key: ${errorMessage}`);
	}
}

export async function getAllApiKeys(userId: string): Promise<ApiKeyData[]> {
	try {
		const keyRecords = await db
			.select()
			.from(keys)
			.where(eq(keys.userId, userId));

		const decryptedKeys: ApiKeyData[] = [];

		for (const record of keyRecords) {
			try {
				const keyIvBuffer = Buffer.from(record.keyIv, "base64");
				const salt = keyIvBuffer.subarray(0, 16);
				const iv = keyIvBuffer.subarray(16);

				const decryptedKey = await decryptApiKey(
					Buffer.from(record.keyCiphertext, "base64"),
					iv,
					Buffer.from(record.keyTag!, "base64"),
					salt,
				);

				decryptedKeys.push({
					id: record.id,
					provider: record.provider,
					key: decryptedKey,
					createdAt: record.createdAt,
					updatedAt: record.updatedAt,
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";
				throw new Error(`Failed to decrypt API key: ${errorMessage}`);
			}
		}

		return decryptedKeys;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to retrieve all API keys: ${errorMessage}`);
	}
}

export async function updateApiKey(
	keyId: string,
	userId: string,
	newApiKey: string,
): Promise<boolean> {
	try {
		const { ciphertext, iv, tag, salt } = await encryptApiKey(newApiKey);

		await db
			.update(keys)
			.set({
				keyCiphertext: ciphertext.toString("base64"),
				keyIv: Buffer.concat([salt, iv]).toString("base64"),
				keyTag: tag.toString("base64"),
				updatedAt: new Date(),
			})
			.where(and(eq(keys.id, keyId), eq(keys.userId, userId)));

		const [keyRecord] = await db
			.select({ provider: keys.provider })
			.from(keys)
			.where(eq(keys.id, keyId))
			.limit(1);

		if (keyRecord) {
			const cacheKey = `${userId}:${keyRecord.provider}`;
			keyCache.delete(cacheKey);
			cacheTimestamps.delete(cacheKey);
		}

		return true;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to update API key: ${errorMessage}`);
	}
}

export async function deleteApiKey(
	keyId: string,
	userId: string,
): Promise<boolean> {
	try {
		const [keyRecord] = await db
			.select({ provider: keys.provider })
			.from(keys)
			.where(and(eq(keys.id, keyId), eq(keys.userId, userId)))
			.limit(1);

		if (!keyRecord) {
			return false;
		}

		await db
			.delete(keys)
			.where(and(eq(keys.id, keyId), eq(keys.userId, userId)));

		const cacheKey = `${userId}:${keyRecord.provider}`;
		keyCache.delete(cacheKey);
		cacheTimestamps.delete(cacheKey);

		return true;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to delete API key: ${errorMessage}`);
	}
}

export async function hasApiKey(
	userId: string,
	provider: Provider,
): Promise<boolean> {
	const key = await getApiKey(userId, provider);
	return key !== null;
}

export function clearUserKeyCache(userId: string): void {
	for (const [cacheKey] of keyCache) {
		if (cacheKey.startsWith(`${userId}:`)) {
			keyCache.delete(cacheKey);
			cacheTimestamps.delete(cacheKey);
		}
	}
}

export function clearAllKeyCache(): void {
	keyCache.clear();
	cacheTimestamps.clear();
}

export interface R2CredentialMeta {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface R2Credentials {
	endpoint: string;
	accessKeyId: string;
	secretAccessKey: string;
	publicAccessUrl: string;
	bucket: string;
}

export async function storeR2Credentials(
	userId: string,
	credentials: R2Credentials,
): Promise<string> {
	try {
		await deleteR2Credentials(userId);

		const credentialsJson = JSON.stringify(credentials);
		const { ciphertext, iv, tag, salt } =
			await encryptApiKey(credentialsJson);

		const [result] = await db
			.insert(keys)
			.values({
				id: randomUUID(),
				userId,
				provider: "r2",
				keyCiphertext: ciphertext.toString("base64"),
				keyIv: Buffer.concat([salt, iv]).toString("base64"),
				keyTag: tag.toString("base64"),
				algo: "AES-256-GCM",
			})
			.returning({ id: keys.id });

		clearR2CredentialCache(userId);

		return result.id;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to store R2 credentials: ${errorMessage}`);
	}
}

export async function getR2Credentials(
	userId: string,
): Promise<R2Credentials | null> {
	try {
		const [keyRecord] = await db
			.select()
			.from(keys)
			.where(and(eq(keys.userId, userId), eq(keys.provider, "r2")))
			.limit(1);

		if (!keyRecord) {
			return null;
		}

		const keyIvBuffer = Buffer.from(keyRecord.keyIv, "base64");
		const salt = keyIvBuffer.subarray(0, 16);
		const iv = keyIvBuffer.subarray(16);

		const decryptedJson = await decryptApiKey(
			Buffer.from(keyRecord.keyCiphertext, "base64"),
			iv,
			Buffer.from(keyRecord.keyTag!, "base64"),
			salt,
		);

		const credentials = JSON.parse(decryptedJson) as R2Credentials;

		if (
			credentials.endpoint &&
			credentials.accessKeyId &&
			credentials.secretAccessKey &&
			credentials.publicAccessUrl &&
			credentials.bucket
		) {
			return credentials;
		}

		return null;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to retrieve R2 credentials: ${errorMessage}`);
	}
}

export async function getR2CredentialMeta(
	userId: string,
): Promise<R2CredentialMeta | null> {
	try {
		const [record] = await db
			.select({
				id: keys.id,
				createdAt: keys.createdAt,
				updatedAt: keys.updatedAt,
			})
			.from(keys)
			.where(and(eq(keys.userId, userId), eq(keys.provider, "r2")))
			.limit(1);

		return record ?? null;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(errorMessage);
	}
}

export async function hasR2Credentials(userId: string): Promise<boolean> {
	const credentials = await getR2Credentials(userId);
	return credentials !== null;
}

export async function deleteR2Credentials(userId: string): Promise<boolean> {
	try {
		await db
			.delete(keys)
			.where(and(eq(keys.userId, userId), eq(keys.provider, "r2")));

		clearR2CredentialCache(userId);
		return true;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw new Error(`Failed to delete R2 credentials: ${errorMessage}`);
	}
}

function clearR2CredentialCache(userId: string): void {
	for (const [cacheKey] of keyCache) {
		if (cacheKey.startsWith(`${userId}:r2`)) {
			keyCache.delete(cacheKey);
			cacheTimestamps.delete(cacheKey);
		}
	}
}
