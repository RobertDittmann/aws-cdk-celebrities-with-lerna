import {Construct} from '@aws-cdk/core';
import * as codebuild from "@aws-cdk/aws-codebuild";

export class LambdaBuildAndTestProject extends Construct {
    public readonly project: codebuild.PipelineProject;

    constructor(app: Construct, id: string) {
        super(app, id);

        this.project = new codebuild.PipelineProject(this, `LambdaBuildAndTestProject`, {
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        commands: [
                            'yarn run ci'
                        ],
                    },
                    build: {
                        commands: [
                            'yarn test:lambda'
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
