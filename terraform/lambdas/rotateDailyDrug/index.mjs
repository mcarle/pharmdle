import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({});

export const handler = async (event) => {
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: process.env.DRUG_NAMES_KEY,
      })
    );

    const str = await response.Body.transformToString();
    const drugs = str.split('\n');
    const indx = Math.floor(Math.random() * drugs.length - 1);
    const newDrug = drugs[indx];
    console.log(`new drug: ${newDrug}, writing to S3`);

    // write new value to S3
    const writeResponse = await client.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: process.env.DAILY_DRUG_KEY,
        Body: newDrug
      })
    );

    console.log(writeResponse); 
    if (writeResponse.$metadata.httpStatusCode != 200) {
      throw new Error('Error writing to S3');
    }
  } catch (err) {
    console.log(err);
    const message = `Error rotating S3 daily drug`;
    console.log(message);
    throw new Error(message);
  }
};
