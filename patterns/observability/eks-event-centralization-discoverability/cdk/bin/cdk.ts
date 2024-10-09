#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { EKSDiscoveryLambda } from '../lib/eks-discovery-lambda';
import { CrossAccountRole } from '../lib/cross-account-role';
import { EKSDiscoveryStackSet } from '../lib/eks-discovery-stackset';
import { OrganizationsClient, ListRootsCommand } from "@aws-sdk/client-organizations";


const eksDiscoveryApp = new cdk.App();

// Deploy Lambda that performs discovery
new EKSDiscoveryLambda(eksDiscoveryApp, 'EKSDiscoveryLambda');   

// Obtain list of AWS Organization roots and deploy stackset app
const client = new OrganizationsClient({region: 'us-east-1'});
const command = new ListRootsCommand({});
client.send(command)
    .then(response => {

      // Obtain the AWS organization root IDs 
      const rootIds = response.Roots?.map(root => root.Id)
        .filter((id): id is string => id !== undefined) ?? [];

        // Deploy Stackset
      new EKSDiscoveryStackSet(eksDiscoveryApp, 'EKSDiscoveryStackSet', {organizationalRootIds: rootIds});
    })
    .catch(error => {
      console.error("Error listing organization roots:", error);
      throw error;
    });

