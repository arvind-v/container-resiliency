import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { EKSDiscoveryStackSetProps } from './eks-discovery-stackset-props';
import { StackSet, StackSetStack, StackSetTemplate, Capability, DeploymentType, StackSetTarget } from 'cdk-stacksets';

export class EKSDiscoveryStackSet extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EKSDiscoveryStackSetProps) {
    super(scope, id, props);

      const rootIds = props.organizationalRootIds;

      const crossAccountRole = new StackSetStack(this, 'CrossAccountRole');

      new StackSet (this, 'EKSDiscoveryStackSet', {
        stackSetName: 'eks-discovery-stackset',
        template: StackSetTemplate.fromStackSetStack(crossAccountRole),
        target: StackSetTarget.fromOrganizationalUnits({
          regions: [this.region],
          organizationalUnits: rootIds
        }),        
        deploymentType: DeploymentType.serviceManaged({
          delegatedAdmin: true,
          autoDeployEnabled: true,
          autoDeployRetainStacks: false,
        }),     
        capabilities: [Capability.NAMED_IAM]
      })

      /*
      // Stackset to setup cross account role for Lambda 
      const cfnStackSet = new cdk.CfnStackSet(this, 'eks-discovery-stackset', {
        stackSetName: 'eks-discovery-stackset',
        templateBody: JSON.stringify(cfnTemplate),
        permissionModel: 'SERVICE_MANAGED',
        capabilities: ['CAPABILITY_NAMED_IAM'],
        callAs: 'DELEGATED_ADMIN',
        autoDeployment: {
          enabled: true,
          retainStacksOnAccountRemoval: false
        },
        stackInstancesGroup:  [
          {
            deploymentTargets: {
              organizationalUnitIds: rootIds
            },
            regions: [this.region]
          }
        ]
      })   

    new cdk.CfnOutput(this, 'eksDiscoveryLambdaArn', {
      exportName: 'eksDiscoveryLambdaArn',
      value: cfnStackSet.toString()
    })
    */

  }
}
