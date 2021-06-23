import * as sdk from 'aws-sdk';
const random = require('random');
const dynamodb = new sdk.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME ? process.env.TABLE_NAME : '';

exports.handler = async (event: any) => {
    console.log(`Trying to process the event: ${JSON.stringify(event)}`)

    const results = await dynamodb.get({
        TableName: TABLE_NAME,
        Key: {
            id: event.pathParameters.id,
        },
    }).promise();

    console.log(`Received item: ${JSON.stringify(results.Item)}`);
    console.log(`Random boolean ${random.boolean()}`); // not important

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(results.Item)
    };
};
