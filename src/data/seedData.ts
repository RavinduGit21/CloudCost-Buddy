import type { Project } from '../types';

export const INITIAL_SEED_PROJECTS: Project[] = [
  {
    id: 'proj-ecommerce-platform',
    name: 'E-Commerce Platform',
    description: 'Production e-commerce cluster with compute, assets & caching',
    region: 'us-east-1',
    createdAt: '2026-10-09T22:08:00.000Z',
    updatedAt: '2026-10-09T22:08:00.000Z',
    notes: 'Primary retail storefront with microservices and media storage',
    services: [
      {
        id: 'svc-ec2-prod',
        config: {
          serviceType: 'ec2',
          instanceCount: 2,
          hoursPerMonth: 726,
          instanceTier: 't3.micro',
          operatingSystem: 'linux',
        },
      },
      {
        id: 'svc-s3-prod',
        config: {
          serviceType: 's3',
          storageGB: 139,
          requestsPerMonth: 0,
        },
      },
      {
        id: 'svc-lambda-prod',
        config: {
          serviceType: 'lambda',
          invocationsPerMonth: 2_000_000,
          avgDurationMs: 102,
          memoryMB: 512,
        },
      },
      {
        id: 'svc-dynamodb-prod',
        config: {
          serviceType: 'dynamodb',
          writeRequestsPerMonth: 2_000_000,
          readRequestsPerMonth: 4_840_000,
          storageGB: 1,
        },
      },
    ],
  },
  {
    id: 'proj-static-website',
    name: 'Static Website (S3)',
    description: 'SPA frontend with global edge CDN distribution',
    region: 'ap-southeast-1',
    createdAt: '2026-10-07T15:45:00.000Z',
    updatedAt: '2026-10-07T15:45:00.000Z',
    notes: 'Static documentation and marketing assets',
    services: [
      {
        id: 'svc-s3-static',
        config: {
          serviceType: 's3',
          storageGB: 50,
          requestsPerMonth: 26000,
        },
      },
    ],
  },
  {
    id: 'proj-serverless-api',
    name: 'Serverless API (Lambda + DynamoDB)',
    description: 'Event-driven serverless REST microservices',
    region: 'us-east-1',
    createdAt: '2026-10-05T20:12:00.000Z',
    updatedAt: '2026-10-05T20:12:00.000Z',
    notes: 'User authentication & transactional order processing',
    services: [
      {
        id: 'svc-lambda-api',
        config: {
          serviceType: 'lambda',
          invocationsPerMonth: 4_000_000,
          avgDurationMs: 120,
          memoryMB: 256,
        },
      },
      {
        id: 'svc-dynamodb-api',
        config: {
          serviceType: 'dynamodb',
          writeRequestsPerMonth: 2_000_000,
          readRequestsPerMonth: 4_000_000,
          storageGB: 2,
        },
      },
    ],
  },
];
