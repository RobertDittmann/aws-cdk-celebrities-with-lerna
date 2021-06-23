import {Construct, SecretValue} from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import {GitHubTrigger} from "@aws-cdk/aws-codepipeline-actions";
import * as ssm from "@aws-cdk/aws-ssm";

export interface GithubActionProps {
    readonly branchName: string;
    readonly repo: string;
    readonly repoOwner: string;
    readonly repoSecretName: string;
}

export class GithubAction extends Construct {
    public readonly action: codepipeline_actions.GitHubSourceAction;
    public readonly source: codepipeline.Artifact;

    constructor(app: Construct, id: string, props: GithubActionProps) {
        super(app, id);

        this.source = new codepipeline.Artifact(`Source`);

        const token = ssm.StringParameter.fromStringParameterAttributes(this, 'ImportedGithubToken', {
            parameterName: `${props.repoSecretName}` ? `${props.repoSecretName}` : 'RobertDittmannGithubToken', // will take latest
        }).stringValue;

        this.action = new codepipeline_actions.GitHubSourceAction({
            owner: `${props.repoOwner}`,
            repo: `${props.repo}`,
            branch: `${props.branchName}`,
            actionName: 'Pull_Source',
            output: this.source,
            trigger: GitHubTrigger.POLL,
            oauthToken: SecretValue.plainText(token)
        });
    }
}
