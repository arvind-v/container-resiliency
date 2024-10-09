import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CrossAccountStack } from './cross-account-stack';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class CdkStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
   
    // EKS Discovery Lambda function
    const eksDiscoveryLambda = new lambda.Function (this, 'eks-discovery-lambda', {
      description: 'Porfolio lambda function',
      handler: 'index.lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_12,
      code: lambda.Code.fromAsset('../lambda'),
      timeout: cdk.Duration.seconds(300),
      environment: {
        SNS_TOPIC_ARN: "foo", // TODO: update
        S3_BUCKET_NAME: "bar" // TODO: update
      }
    })

    // Allow Lambda to create log group 
    eksDiscoveryLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["logs:CreateLogGroup"],
      resources: [`arn:aws:logs:region:${this.account}:*`] 
    }))
    
    // Enable logging 
    eksDiscoveryLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
      resources: ['arn:aws:logs:::log-group:/aws/lambda/*:*'] 
    }))

    // Enable writes to S3 to capture discovery data
    eksDiscoveryLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:PutObject'],
      resources: ['*']  //arn:aws:s3:::${EKSDiscoveryS3Bucket}/cluster_info_all_accounts_*
    }))    

    // TODO: Cleanup 
    eksDiscoveryLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['organizations:ListAccounts', 'sns:Publish'],
      resources: ['*']
    }))
    
    // Allow access to cross-account role 
    eksDiscoveryLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      resources: ['*'] // can be tightened to just the lambda execution role name arn:aws:iam::role/eks-discovery-role' in any account
    }))
   
    /**
     * Stackset section
     */

    const crossAccountApp = new cdk.App();
    const crossAccountStack = new CrossAccountStack(crossAccountApp, 'CrossAccountStack');
    const assembly = crossAccountApp.synth().getStackByName(crossAccountStack.stackName);
    const crossAccountCfnTemplate = assembly.template;


    // Stackset to setup cross account role for Lambda 
    const cfnStackSet = new cdk.CfnStackSet(this, 'eks-discovery-stackset', {
      stackSetName: 'eks-discovery-stackset',
      templateBody: JSON.stringify(crossAccountCfnTemplate),
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
            organizationalUnitIds: ['r-0ble']
          },
          regions: [this.region]
        }
      ]
    })

  }
}
