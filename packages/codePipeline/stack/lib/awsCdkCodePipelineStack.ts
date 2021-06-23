import {Construct, Stack, StackProps} from '@aws-cdk/core';
import {PipelineRoles} from './roles/pipelineRoles';
import {PipelineS3Bucket} from "./s3/pipelineS3Bucket";
import {GithubAction} from "./codepipeline/action/source/githubAction";
import {RebuildPipeline} from "./codepipeline/action/codebuild/rebuildPipeline";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import {BuildCelebritiesRekognitionStack} from "./codepipeline/action/codebuild/buildCelebritiesRekognitionStack";
import {EndpointLambda} from "./codepipeline/action/codebuild/endpointLambda";
import {BuildAgwStack} from "./codepipeline/action/codebuild/buildAgwStack";


export interface AwsCdkPipelineCelebritiesStackProps extends StackProps {
    readonly envName: string;
    readonly branchName: string;
    readonly repo: string;
    readonly repoOwner: string;
    readonly repoSecretName: string;
}

export class AwsCdkCodePipelineStack extends Stack {
    constructor(app: Construct, id: string, props?: AwsCdkPipelineCelebritiesStackProps) {
        const stackName = props?.envName + '-pipeline'; // to generate all stack names using ENV_NAME
        super(app, id, {
            stackName: stackName, // set STACK NAME for stack
            ...props
        });

        // ROLES
        const pipelineRoles = new PipelineRoles(this, 'PipelineRoles');

        // ARTIFACTS BUCKET
        const pipelineArtifactsBucket = new PipelineS3Bucket(this, 'PipelineArtifactsBucket', {
            envName: `${props?.envName}` // only props?.envName will not work cause thinks undefined
        });

        // SOURCE ACTION
        const githubAction = new GithubAction(this, 'GithubAction', {
            branchName: `${props?.branchName}`,
            repo: `${props?.repo}`,
            repoSecretName: `${props?.repoSecretName}`,
            repoOwner: `${props?.repoOwner}`
        });

        // CODE BUILDS
        const updatePipeline = new RebuildPipeline(this, 'RebuildPipeline', {
            source: githubAction.source,
            role: pipelineRoles.adminRoleForCodeBuild,
            envName: `${props?.envName}`,
            branchName: `${props?.branchName}`,
            repo: `${props?.repo}`,
            repoOwner: `${props?.repoOwner}`,
            repoSecretName: `${props?.repoSecretName}`
        });

        // const endpointLambdaBuild = new EndpointLambda(this, 'EndpointLambdaBuild', {
        //     source: githubAction.source,
        //     envName: `${props?.envName}`
        // })
        //
        // // STACKS
        // const deployCelebritiesRekognitionStack = new BuildCelebritiesRekognitionStack(this, 'DeployCelebritiesRekognition', {
        //     role: pipelineRoles.adminRoleForCodeBuild,
        //     envName: `${props?.envName}`,
        //     source: githubAction.source,
        // });
        //
        // const buildAgwStack = new BuildAgwStack(this, 'DeployAgw', {
        //     source: githubAction.source,
        //     role: pipelineRoles.adminRoleForCodeBuild,
        //     envName: `${props?.envName}`
        // });

        new codepipeline.Pipeline(this, `Pipeline`, {
            pipelineName: `${props?.envName}-Pipeline`,
            artifactBucket: pipelineArtifactsBucket.bucket,
            role: pipelineRoles.adminRoleForCodePipeline,
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        githubAction.action
                    ],
                },
                {
                    stageName: 'Pipeline_Update',
                    actions: [
                        updatePipeline.action
                    ],
                },
                // {
                //     stageName: 'Build',
                //     actions: [
                //         endpointLambdaBuild.action
                //     ],
                // },
                // {
                //     stageName: 'Deploy',
                //     actions: [
                //         deployCelebritiesRekognitionStack.action,
                //         buildAgwStack.action
                //     ],
                // }
            ],

        });

    }
}
