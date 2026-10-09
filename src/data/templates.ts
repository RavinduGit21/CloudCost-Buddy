/**
 * Pre-configured Architecture Templates
 *
 * Beginners can launch these templates with one click to quickly explore
 * common AWS architectural patterns.
 */

import type { ProjectService, AWSRegion } from '../types';

export interface ArchitectureTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: 'server' | 'zap' | 'globe' | 'database';
  region: AWSRegion;
  services: ProjectService[];
  estimatedMonthly: number;
}

export const POPULAR_TEMPLATES: ArchitectureTemplate[] = [
  {
    id: 'starter-web-app',
    name: 'Starter Web App',
    description: 'EC2 + S3 for a simple web application',
    category: 'Full-Stack',
    icon: 'server',
    region: 'us-east-1',
    estimatedMonthly: 10.14,
    services: [
      {
        id: 'tpl-ec2-1',
        config: {
          serviceType: 'ec2',
          instanceCount: 1,
          hoursPerMonth: 730,
          instanceTier: 't3.micro',
          operatingSystem: 'linux',
        },
      },
      {
        id: 'tpl-s3-1',
        config: {
          serviceType: 's3',
          storageGB: 100,
          requestsPerMonth: 50000,
        },
      },
    ],
  },
  {
    id: 'serverless-api',
    name: 'Serverless REST API',
    description: 'Lambda + DynamoDB',
    category: 'Serverless',
    icon: 'zap',
    region: 'us-east-1',
    estimatedMonthly: 6.45,
    services: [
      {
        id: 'tpl-lambda-1',
        config: {
          serviceType: 'lambda',
          invocationsPerMonth: 4_000_000,
          avgDurationMs: 120,
          memoryMB: 256,
        },
      },
      {
        id: 'tpl-dynamodb-1',
        config: {
          serviceType: 'dynamodb',
          writeRequestsPerMonth: 2_000_000,
          readRequestsPerMonth: 4_000_000,
          storageGB: 2,
        },
      },
    ],
  },
  {
    id: 'static-website',
    name: 'Static Website',
    description: 'S3 with high request volume',
    category: 'Frontend',
    icon: 'globe',
    region: 'ap-southeast-1',
    estimatedMonthly: 1.28,
    services: [
      {
        id: 'tpl-s3-2',
        config: {
          serviceType: 's3',
          storageGB: 50,
          requestsPerMonth: 20000,
        },
      },
    ],
  },
];
