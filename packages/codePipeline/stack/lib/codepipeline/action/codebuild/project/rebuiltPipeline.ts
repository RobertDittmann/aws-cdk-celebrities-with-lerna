import {Construct} from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as codebuild from "@aws-cdk/aws-codebuild";

export interface RebuildPipelineProjectProps {
    readonly envName: string;
    readonly role: iam.Role;
}

export class RebuildPipelineProject extends Construct {
    public readonly project: codebuild.PipelineProject;

    constructor(app: Construct, id: string, props: RebuildPipelineProjectProps) {
        super(app, id);

        this.project = new codebuild.PipelineProject(this, `PipelineBuild`, {
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
                            `yarn synth:pipeline:${props.envName}`,
                            `yarn deploy:pipeline:${props.envName}`,
                        ],
                    },
                }
            }),
            role: props.role,
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
            }
        });
    }
}
