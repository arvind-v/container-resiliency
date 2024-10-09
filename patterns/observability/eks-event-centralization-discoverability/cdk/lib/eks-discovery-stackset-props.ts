import * as cdk from 'aws-cdk-lib';

export interface EKSDiscoveryStackSetProps extends cdk.StackProps {
  organizationalRootIds: string []
}