import {Construct} from "@aws-cdk/core";
import * as iam from '@aws-cdk/aws-iam';

export class PipelineRoles extends Construct {
    public readonly adminRoleForCodeBuild: iam.Role;
    public readonly adminRoleForCodePipeline: iam.Role;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // for now it can be too much
        const adminRoleForCodeBuild = new iam.Role(this, `AdminCodeBuildRole`, {
            assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com')
        })
        adminRoleForCodeBuild.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

        // for now it can be too much
        const adminRoleForCodePipeline = new iam.Role(this, `AdminCodePipelineRole`, {
            assumedBy: new iam.ServicePrincipal('codepipeline.amazonaws.com')
        })
        adminRoleForCodePipeline.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

        this.adminRoleForCodePipeline = adminRoleForCodePipeline; // VERY IMPORTANT to assign it at the end
        this.adminRoleForCodeBuild = adminRoleForCodeBuild; // VERY IMPORTANT to assign it at the end
    }
}
