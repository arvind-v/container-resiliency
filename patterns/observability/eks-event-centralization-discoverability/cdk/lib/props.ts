import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface SharedProps extends cdk.StackProps {
  lambdaArn: string;
}