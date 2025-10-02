import { S3Client } from "@aws-sdk/client-s3";
import { getR2Credentials, type R2Credentials } from "./api-keys";
import { env } from "./env";

export function createR2Client(credentials: R2Credentials): S3Client {
	return new S3Client({
		region: "auto",
		endpoint: credentials.endpoint,
		credentials: {
			accessKeyId: credentials.accessKeyId,
			secretAccessKey: credentials.secretAccessKey,
		},
	});
}

export function getR2PublicUrl(
	credentials: R2Credentials,
	filePath: string,
): string {
	const baseUrl = credentials.publicAccessUrl.replace(/\/+$/, "");
	const bucketName = credentials.bucket;

	return baseUrl
		? `${baseUrl}/${bucketName}/${filePath}`
		: `/${bucketName}/${filePath}`;
}

export async function uploadFileToR2(
	credentials: R2Credentials,
	filePath: string,
	fileBuffer: Buffer,
	contentType: string,
	metadata?: Record<string, string>,
): Promise<void> {
	const s3Client = createR2Client(credentials);
	const { PutObjectCommand } = await import("@aws-sdk/client-s3");

	const uploadCommand = new PutObjectCommand({
		Bucket: credentials.bucket,
		Key: filePath,
		Body: fileBuffer,
		ContentType: contentType,
		Metadata: metadata || {},
	});

	await s3Client.send(uploadCommand);
}

export async function deleteFileFromR2(
	credentials: R2Credentials,
	filePath: string,
): Promise<void> {
	const s3Client = createR2Client(credentials);
	const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");

	const deleteCommand = new DeleteObjectCommand({
		Bucket: credentials.bucket,
		Key: filePath,
	});

	await s3Client.send(deleteCommand);
}

export async function fileExistsInR2(
	credentials: R2Credentials,
	filePath: string,
): Promise<boolean> {
	const s3Client = createR2Client(credentials);
	const { HeadObjectCommand } = await import("@aws-sdk/client-s3");

	try {
		const headCommand = new HeadObjectCommand({
			Bucket: credentials.bucket,
			Key: filePath,
		});
		await s3Client.send(headCommand);
		return true;
	} catch (error: unknown) {
		const awsError = error as {
			name?: string;
			$metadata?: { httpStatusCode?: number };
		};
		if (
			awsError.name === "NotFound" ||
			awsError.$metadata?.httpStatusCode === 404
		) {
			return false;
		}
		throw error;
	}
}

export function getR2CredentialsFromEnv(): R2Credentials | null {
	if (
		!env.R2_S3_API_ENDPOINT ||
		!env.R2_ACCESS_KEY_ID ||
		!env.R2_SECRET_ACCESS_KEY ||
		!env.R2_PUBLIC_ACCESS_URL ||
		!env.R2_PUBLIC_BUCKET
	) {
		return null;
	}

	return {
		endpoint: env.R2_S3_API_ENDPOINT,
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
		publicAccessUrl: env.R2_PUBLIC_ACCESS_URL,
		bucket: env.R2_PUBLIC_BUCKET,
	};
}

export async function getR2CredentialsForUser(
	userId: string,
): Promise<R2Credentials> {
	// First try to get user-specific credentials
	const userCredentials = await getR2Credentials(userId);
	if (userCredentials) {
		return userCredentials;
	}

	// Fall back to environment variables
	const envCredentials = getR2CredentialsFromEnv();
	if (envCredentials) {
		return envCredentials;
	}

	throw new Error(
		"R2 credentials not configured. Please configure your R2 credentials in settings or environment variables.",
	);
}
