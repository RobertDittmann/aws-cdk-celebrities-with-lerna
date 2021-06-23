#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {CelebritiesStack} from '../lib/celebrities-stack';

const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : '';
if (!NODE_ENV) {
    throw Error(`NODE_ENV not defined !!!`)
}
require ('custom-env').env(process.env.NODE_ENV);

const ENV_NAME = process.env.ENV_NAME ? process.env.ENV_NAME.toLowerCase() : '';
const app = new cdk.App();

if (!ENV_NAME) {
    throw Error(`ENV_NAME not defined !!!`)
}

new CelebritiesStack(app, 'CelebritiesStack', {
    envName: ENV_NAME
});

app.synth();
