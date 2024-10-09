import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { SharedProps } from './props';

export class CrossAccountStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
   
    const crossAccountRole = new iam.Role(this, 'cross-account-role', {
      assumedBy: new iam.ArnPrincipal(`arn:aws:iam::${this.account}:role/my-lambda-execution-role`),
      roleName: 'eks-discovery-role'
    });

    crossAccountRole.addToPolicy(new iam.PolicyStatement({
      actions: ['eks:ListCluster', 'eks:DescribeCluster', 'eks:ListTagsForResource'],
      resources: ['*'],
    }))
  


  }
}
