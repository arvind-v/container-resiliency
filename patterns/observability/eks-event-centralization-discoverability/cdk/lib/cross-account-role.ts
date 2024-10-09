import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { StackSetStack } from 'cdk-stacksets';

/**
 * Cross account role to be deployed across the AWS Organization
 */
export class CrossAccountRole extends StackSetStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const lambdaArn = cdk.Fn.importValue("eksDiscoveryLambdaArn");
   
    const crossAccountRole = new iam.Role(this, 'cross-account-role', {
      assumedBy: new iam.ArnPrincipal(lambdaArn),
      roleName: 'eks-discovery-role'
    });

    crossAccountRole.addToPolicy(new iam.PolicyStatement({
      actions: ['eks:ListCluster', 'eks:DescribeCluster', 'eks:ListTagsForResource'],
      resources: ['*'],
    }))
  }
}
