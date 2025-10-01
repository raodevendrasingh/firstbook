import {
	createCipheriv,
	createDecipheriv,
	randomBytes,
	scrypt,
} from "node:crypto";
import { promisify } from "node:util";
import { env } from "@/lib/env";

const scryptAsync = promisify(scrypt);

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

function getEncryptionKey(): string {
	const key = env.API_KEY_ENCRYPTION_SECRET;
	if (!key) {
		throw new Error(
			"API_KEY_ENCRYPTION_SECRET environment variable is required",
		);
	}
	return key;
}

async function deriveKey(masterKey: string, salt: Buffer): Promise<Buffer> {
	return (await scryptAsync(masterKey, salt, KEY_LENGTH)) as Buffer;
}

export async function encryptApiKey(apiKey: string): Promise<{
	ciphertext: Buffer;
	iv: Buffer;
	tag: Buffer;
	salt: Buffer;
}> {
	const masterKey = getEncryptionKey();
	const salt = randomBytes(16);
	const iv = randomBytes(IV_LENGTH);
	const derivedKey = await deriveKey(masterKey, salt);

	const cipher = createCipheriv(ALGORITHM, derivedKey, iv);
	cipher.setAAD(salt);

	let ciphertext = cipher.update(apiKey, "utf8");
	ciphertext = Buffer.concat([ciphertext, cipher.final()]);

	const tag = cipher.getAuthTag();

	return {
		ciphertext,
		iv,
		tag,
		salt,
	};
}

export async function decryptApiKey(
	ciphertext: Buffer,
	iv: Buffer,
	tag: Buffer,
	salt: Buffer,
): Promise<string> {
	const masterKey = getEncryptionKey();
	const derivedKey = await deriveKey(masterKey, salt);

	const decipher = createDecipheriv(ALGORITHM, derivedKey, iv);
	decipher.setAAD(salt);
	decipher.setAuthTag(tag);

	let decrypted = decipher.update(ciphertext);
	decrypted = Buffer.concat([decrypted, decipher.final()]);

	return decrypted.toString("utf8");
}
