import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({});

export const handler = async (event) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    const bucket = process.env.BUCKET_NAME;
    const key = process.env.DAILY_DRUG_KEY;

    try {
        const response = await client.send(
            new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            }),
            );    
            const str = await response.Body.transformToString();
            return {
                statusCode: 200, 
                body: str
            }

} catch (err) {
        console.log(err);
        const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
        console.log(message);
        throw new Error(message);
    }
};
