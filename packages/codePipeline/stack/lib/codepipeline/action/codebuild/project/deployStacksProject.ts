import {Construct} from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as codebuild from "@aws-cdk/aws-codebuild";

export interface BuildCelebritiesRekognitionProjectProps {
    readonly envName: string;
    readonly role: iam.Role;
}

export class DeployStacksProject extends Construct {
    public readonly project: codebuild.PipelineProject;

    constructor(app: Construct, id: string, props: BuildCelebritiesRekognitionProjectProps) {
        super(app, id);

        this.project = new codebuild.PipelineProject(this, `CelebritiesProject`, {
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
                            'yarn build:lambda',
                            `yarn synth:stack:${props.envName}`,
                            `yarn deploy:stack:${props.envName}`,
                        ],
                    },
                },
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
            },
            role: props.role
        });
    }
}
