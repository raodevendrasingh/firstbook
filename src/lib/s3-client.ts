import { S3Client } from "@aws-sdk/client-s3";

export const getS3Client = () => {
	return new S3Client({
		region: "auto",
		endpoint: process.env.R2_S3_API_ENDPOINT!,
		credentials: {
			accessKeyId: process.env.R2_ACCESS_KEY_ID!,
			secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
		},
	});
};
