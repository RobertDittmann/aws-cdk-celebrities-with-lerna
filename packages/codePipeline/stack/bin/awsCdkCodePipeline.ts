#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {AwsCdkCodePipelineStack} from '../lib/awsCdkCodePipelineStack';

const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : '';
if (!NODE_ENV) {
    throw Error(`NODE_ENV not defined !!!`)
}
require ('custom-env').env(process.env.NODE_ENV);

const ENV_NAME = process.env.ENV_NAME ? process.env.ENV_NAME.toLowerCase() : '';
const BRANCH_NAME = process.env.BRANCH_NAME ? process.env.BRANCH_NAME : '';
const REPO = process.env.REPO ? process.env.REPO : '';
const REPO_OWNER = process.env.REPO_OWNER ? process.env.REPO_OWNER : '';
const REPO_SECRET_NAME = process.env.REPO_SECRET_NAME ? process.env.REPO_SECRET_NAME : '';
const UPDATE_PIPELINE_STAGE = process.env.UPDATE_PIPELINE_STAGE === 'true';


const app = new cdk.App();

if (!ENV_NAME) {
    throw Error(`ENV_NAME not defined !!!`)
} else if (!BRANCH_NAME) {
    throw Error(`BRANCH_NAME not defined !!!`)
} else if (!REPO) {
    throw Error(`REPO not defined !!!`)
} else if (!REPO_OWNER) {
    throw Error(`REPO_OWNER not defined !!!`)
} else if (!REPO_SECRET_NAME) {
    throw Error(`REPO_SECRET_NAME not defined !!!`)
}

new AwsCdkCodePipelineStack(app, 'AwsCdkCodePipelineStack', {
    envName: ENV_NAME,
    branchName: BRANCH_NAME,
    repo: REPO,
    repoOwner: REPO_OWNER,
    repoSecretName: REPO_SECRET_NAME,
    updatePipelineStage: UPDATE_PIPELINE_STAGE
});

app.synth();
