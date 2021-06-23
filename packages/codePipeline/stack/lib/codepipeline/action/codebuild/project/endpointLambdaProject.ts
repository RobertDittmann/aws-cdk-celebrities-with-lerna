import {Construct} from '@aws-cdk/core';
import * as codebuild from "@aws-cdk/aws-codebuild";

export class EndpointLambdaProject extends Construct {
    public readonly project: codebuild.PipelineProject;

    constructor(app: Construct, id: string) {
        super(app, id);

        this.project = new codebuild.PipelineProject(this, `EndpointLambdaProject`, {
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        commands: [
                            'cd functions/endpoint/src',
                            'npm install',
                        ],
                    },
                    build: {
                        commands: [
                            'npm run build',
                            'npm run test',
                        ]
                    },
                    post_build: {
                        commands: [
                            'ls',
                            'rm -rf *endpoint.zip',
                            'ls',
                            'zip -r endpoint.zip endpoint.js node_modules/',
                            'ls'
                        ]
                    }
                }
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
            },
        });
    }
}
