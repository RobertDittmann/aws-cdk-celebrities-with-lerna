import {Construct} from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as codebuild from "@aws-cdk/aws-codebuild";

export interface BuildCelebritiesRekognitionProjectProps {
    readonly envName: string;
    readonly role: iam.Role;
}

export class BuildCelebritiesRekognitionProject extends Construct {
    public readonly project: codebuild.PipelineProject;

    constructor(app: Construct, id: string, props: BuildCelebritiesRekognitionProjectProps) {
        super(app, id);

        this.project = new codebuild.PipelineProject(this, `CelebritiesProject`, {
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        commands: 'npm install',
                    },
                    build: {
                        commands: [
                            'npm run build',
                            'echo $ENV_NAME',
                            `npm run cdk synth CelebritiesRekognitionStack`,
                            `npm run cdk-no-approval CelebritiesRekognitionStack`, // without parameters cause taken from environment
                        ],
                    },
                },
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
            },
            role: props.role,
            environmentVariables: {
                ENV_NAME: {value: props.envName},
            } // to always rebuilt for the same environment !!
        });
    }
}
