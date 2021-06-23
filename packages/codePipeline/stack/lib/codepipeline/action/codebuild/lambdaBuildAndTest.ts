import {Construct} from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import {LambdaBuildAndTestProject} from "./project/lambdaBuildAndTestProject";

export interface EndpointLambdaProps {
    readonly envName: string;
    readonly source: codepipeline.Artifact;
}

export class LambdaBuildAndTest extends Construct {
    public readonly action: codepipeline_actions.CodeBuildAction;

    constructor(app: Construct, id: string, props: EndpointLambdaProps) {
        super(app, id);

        const lambdaBuildAndTestProject = new LambdaBuildAndTestProject(this, 'LambdaBuildAndTestProject');

        this.action = new codepipeline_actions.CodeBuildAction({
            actionName: 'Build_Endpoint_Lambda',
            project: lambdaBuildAndTestProject.project,
            input: props.source
        })
    }
}
