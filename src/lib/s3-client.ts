import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

export const getS3Client = () => {
	return new S3Client({
		region: "auto",
		endpoint: env.R2_S3_API_ENDPOINT!,
		credentials: {
			accessKeyId: env.R2_ACCESS_KEY_ID!,
			secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
		},
	});
};
