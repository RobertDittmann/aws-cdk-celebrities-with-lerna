const path = require('path');
import * as sdk from 'aws-sdk';

const s3 = new sdk.S3();
const rekognition = new sdk.Rekognition();
const dynamodb = new sdk.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME ? process.env.TABLE_NAME : '';

exports.handler = async (event: any) => {
    for (const image of event.Records) {
        console.log(`Trying to process the image: ${JSON.stringify(image)}`);
        const bucket = image.s3.bucket.name;
        const key = image.s3.object.key;

        try {
            const rawImage = await getImage(bucket, key);
            const celebrityMetadata = await getCelebrityMetadata(rawImage);
            await saveMetadata(key, celebrityMetadata);

            console.log(`Successfully saved metadata for ${key} image`);
        } catch (err) {
            console.log(`Failed to save the metadata for ${key} image. Error: ${err}`);
            throw err;
        }
    }
};

const getImage = async (bucket:string, key:string) => {
    console.log('Trying to download the image');
    const image = await s3.getObject({
        Bucket: bucket,
        Key: key,
    }).promise();
    return image.Body;
};

const getCelebrityMetadata = async (image: any) => {
    console.log('Trying to recognize the celebrity on the image');
    const params = {
        Image: {
            Bytes: image,
        },
    };

    const results = await rekognition.recognizeCelebrities(params).promise();
    return results.CelebrityFaces;
};

const saveMetadata = async (key: string, metadata:any) => {
    console.log('Trying to save the metadata to database');
    const fileName = path.parse(key).name;
    return dynamodb.put({
        TableName: TABLE_NAME,
        Item: {
            id: fileName,
            metadata: metadata,
        },
    }).promise();
};
