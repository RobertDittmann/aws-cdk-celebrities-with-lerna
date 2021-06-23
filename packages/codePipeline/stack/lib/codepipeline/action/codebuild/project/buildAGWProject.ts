import {Construct} from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as codebuild from "@aws-cdk/aws-codebuild";

export interface BuildAgwProjectProps {
    readonly envName: string;
    readonly role: iam.Role;
}

export class BuildAgwProject extends Construct {
    public readonly project: codebuild.PipelineProject;

    constructor(app: Construct, id: string, props: BuildAgwProjectProps) {
        super(app, id);

        this.project = new codebuild.PipelineProject(this, `AgwProject`, {
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        commands: 'npm install',
                    },
                    build: {
                        commands: [
                            'npm run build',
                            `npm run cdk synth AgwStack`,
                            `npm run cdk-no-approval AgwStack`,
                        ],
                    },
                },
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
            },
            role: props.role,
            environmentVariables: {
                ENV_NAME: {value: props.envName}
            } // to always rebuilt for the same environment !!
        });
    }
}
