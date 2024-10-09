#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { OrganizationsClient, ListRootsCommand } from "@aws-sdk/client-organizations";

// Get list of organization roots
/* const client = new OrganizationsClient({region: 'us-east-1'});
const command = new ListRootsCommand({});
client.send(command, function (err,data) {
  if (err) {
    console.log(err);
  } else {
    console.log(data);
  }
});
*/


function listOrganizationRootIds(): Promise<string[]> {
  const client = new OrganizationsClient();
  const command = new ListRootsCommand({});

  return client.send(command)
    .then(response => {
      return response.Roots?.map(root => root.Id)
        .filter((id): id is string => id !== undefined) || [];
    })
    .catch(error => {
      console.error("Error listing organization roots:", error);
      throw error;
    });
}

// Usage
listOrganizationRootIds()
  .then(rootIds => {
    console.log("Organization Root IDs:", rootIds);
  })
  .catch(error => {
    console.error("Failed to list organization root IDs:", error);
  });







const app = new cdk.App();
new CdkStack(app, 'CdkStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});




