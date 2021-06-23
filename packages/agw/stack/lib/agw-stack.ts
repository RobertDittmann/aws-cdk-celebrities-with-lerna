import * as cdk from '@aws-cdk/core';
import {StackProps} from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ssm from '@aws-cdk/aws-ssm';
import {HttpApi, HttpMethod} from "@aws-cdk/aws-apigatewayv2";
import * as integration from "@aws-cdk/aws-apigatewayv2-integrations";

export interface AgwStackProps extends StackProps {
    readonly envName: string;
}

export class AgwStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: AgwStackProps) {
        const stackName = props.envName + '-agw-celebrities-rekognition';
        super(scope, id, {
            stackName: stackName,
            ...props
        });

        const lambdaArn = ssm.StringParameter.fromStringParameterAttributes(this, 'EndpointLambdaArn', {
            parameterName: props.envName + '-endpoint-lambda', // will take latest
        }).stringValue;
        const endpointLambda = lambda.Function.fromFunctionArn(this, 'AgwEndpointLambda', lambdaArn);

        const httpApi = new HttpApi(this, `${props.envName}-api`);

        httpApi.addRoutes({
            path: `/metadata/{id}`,
            methods: [HttpMethod.GET],
            integration: new integration.LambdaProxyIntegration({
                handler: endpointLambda
            })
        });
    }
}
