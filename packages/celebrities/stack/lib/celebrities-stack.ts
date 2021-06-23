import * as cdk from '@aws-cdk/core';
import {RemovalPolicy, StackProps} from '@aws-cdk/core';
import * as S3 from '@aws-cdk/aws-s3';
import {BucketAccessControl, BucketEncryption} from '@aws-cdk/aws-s3';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import {BillingMode} from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as IAM from '@aws-cdk/aws-iam';
import * as iam from '@aws-cdk/aws-iam';
import {Effect} from '@aws-cdk/aws-iam';
import {S3EventSource} from '@aws-cdk/aws-lambda-event-sources';
import * as ssm from '@aws-cdk/aws-ssm';
import { NodejsFunction } from 'aws-lambda-nodejs-esbuild';
import * as path from "path";


export interface CelebritiesRekognitionStackProps extends StackProps {
    readonly envName: string;
}

export class CelebritiesStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: CelebritiesRekognitionStackProps) {
        const stackName = props.envName + '-celebrities-rekognition';
        super(scope, id, {
            stackName: stackName,
            ...props
        });

        // S3 BUCKET
        const bucket = new S3.Bucket(this, 'ImagesBucket', {
            encryption: BucketEncryption.S3_MANAGED,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            bucketName: props.envName + '-celebrities-rekognition-images', // it is string so ok
            accessControl: BucketAccessControl.PUBLIC_READ
        });

        // TABLE
        const table = new dynamodb.Table(this, 'RekognitionTable', {
            partitionKey: {name: 'id', type: dynamodb.AttributeType.STRING},
            billingMode: BillingMode.PAY_PER_REQUEST,
            tableName: stackName,
            removalPolicy: RemovalPolicy.DESTROY
        });

        // LAMBDAS
        const generatorFunction = new NodejsFunction(this, 'LambdaGenerator', {
                runtime: lambda.Runtime.NODEJS_14_X,
                handler: 'packages/celebrities/lambdas/generator/src/generator.handler',
                environment: {
                    'TABLE_NAME': table.tableName
                },
                functionName: props.envName + '-generator',
            exclude: [
                'aws-sdk',
                'endpoint.js'
            ],
            timeout: cdk.Duration.seconds(5)
        });

        const endpointFunction = new NodejsFunction(this, 'LambdaEndpoint', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'packages/celebrities/lambdas/endpoint/src/endpoint.handler',
            environment: {
                'TABLE_NAME': table.tableName
            },
            functionName: props.envName + '-endpoint',
            exclude: [
                'aws-sdk',
                'generator.js'
            ],
            timeout: cdk.Duration.seconds(5)
        });
        // const generatorFunction = new lambda.Function(this, 'LambdaGenerator', {
        //     runtime: lambda.Runtime.NODEJS_14_X,
        //     handler: 'generator.handler',
        //     code: lambda.Code.fromAsset('./functions/generator/src'),
        //     environment: {
        //         'TABLE_NAME': table.tableName
        //     },
        //     functionName: props.envName + '-generator'
        // });
        //
        // const endpointFunction = new lambda.Function(this, 'LambdaEndpoint', {
        //     runtime: lambda.Runtime.NODEJS_14_X,
        //     handler: 'endpoint.handler',
        //     code: lambda.Code.fromAsset('./functions/endpoint/src'),
        //     environment: {
        //         'TABLE_NAME': table.tableName
        //     },
        //     functionName: props.envName + '-endpoint',
        // });

        bucket.grantRead(generatorFunction);

        table.grantWriteData(generatorFunction);
        table.grantReadData(endpointFunction);

        generatorFunction.addToRolePolicy(new IAM.PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'rekognition:RecognizeCelebrities'
            ],
            resources: ['*']
        }));
        generatorFunction.addEventSource(new S3EventSource(bucket, {
            events: [S3.EventType.OBJECT_CREATED_PUT]
        }));

        new ssm.StringParameter(this, 'ParameterLambdaEndpoint', {
            allowedPattern: '.*',
            description: 'ARN of lambda endpoint',
            parameterName: process.env.ENV_NAME + '-endpoint-lambda',
            stringValue: endpointFunction.functionArn,
            tier: ssm.ParameterTier.ADVANCED,
        });

        endpointFunction.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com')); // NOT the best cause gives permissions for each API GW endpoint
    }
}
