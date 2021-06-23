import {Construct} from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as iam from '@aws-cdk/aws-iam';
import {DeployStacksProject} from "./project/deployStacksProject";

export interface BuildCelebritiesRecognitionStackProps {
    readonly source: codepipeline.Artifact;
    readonly envName: string;
    readonly role: iam.Role;
}

export class DeployStacks extends Construct {
    public readonly action: codepipeline_actions.CodeBuildAction;

    constructor(app: Construct, id: string, props: BuildCelebritiesRecognitionStackProps) {
        super(app, id);

        const buildCelebritiesRekognitionProject = new DeployStacksProject(this, 'DeployStacksProject', {
            role: props.role,
            envName: `${props.envName}`
        });

        this.action = new codepipeline_actions.CodeBuildAction({
            actionName: 'Deploy_Stacks',
            project: buildCelebritiesRekognitionProject.project,
            input: props.source
        });
    }
}
