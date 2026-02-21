import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({});

export const handler = async (event) => {
    const bucket = process.env.BUCKET_NAME;
    const key = process.env.DAILY_DRUG_KEY;
    const wantHints = event.queryStringParameters?.hints === 'true';

    try {
        const response = await client.send(
            new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            }),
        );
        const str = await response.Body.transformToString();
        const drugObj = JSON.parse(str);

        if (wantHints) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(drugObj),
            };
        }

        return {
            statusCode: 200,
            body: drugObj.name,
        };
    } catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
