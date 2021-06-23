import {Construct} from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import {EndpointLambdaProject} from "./project/endpointLambdaProject";

export interface EndpointLambdaProps {
    readonly envName: string;
    readonly source: codepipeline.Artifact;
}

export class EndpointLambda extends Construct {
    public readonly action: codepipeline_actions.CodeBuildAction;

    constructor(app: Construct, id: string, props: EndpointLambdaProps) {
        super(app, id);

        const endpointLambdaProject = new EndpointLambdaProject(this, 'EndpointLambdaProject');

        this.action = new codepipeline_actions.CodeBuildAction({
            actionName: 'Build_Endpoint_Lambda',
            project: endpointLambdaProject.project,
            input: props.source,
            environmentVariables: {
                ENV_NAME: {value: props.envName}
            } // to always rebuilt for the same environment !!
        })
    }
}
