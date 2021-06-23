import {Construct} from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as iam from '@aws-cdk/aws-iam';
import {BuildCelebritiesRekognitionProject} from "./project/buildCelebritiesRekognitionProject";
import {BuildAgwProject} from "./project/buildAGWProject";

export interface BuildAgwStackProps {
    readonly source: codepipeline.Artifact;
    readonly envName: string;
    readonly role: iam.Role;
}

export class BuildAgwStack extends Construct {
    public readonly action: codepipeline_actions.CodeBuildAction;

    constructor(app: Construct, id: string, props: BuildAgwStackProps) {
        super(app, id);

        const buildAgwProject = new BuildAgwProject(this, 'BuildCelebritiesRekognitionProject', {
            role: props.role,
            envName: `${props.envName}`
        });

        this.action = new codepipeline_actions.CodeBuildAction({
            actionName: 'Deploy_AGW_Stack',
            project: buildAgwProject.project,
            input: props.source,
            runOrder: 2, // should be 2nd action
        });
    }
}
