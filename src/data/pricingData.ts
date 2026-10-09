/**
 * Pricing Data Module
 *
 * This is the single source of truth for all AWS pricing assumptions.
 * Every price is tagged with:
 *   - where it came from (sourceUrl)
 *   - when it was last checked (lastVerified)
 *   - how confident we are (status)
 *
 * ⚠️  These are SAMPLE prices for educational purposes.
 *     AWS prices change over time and vary by region, account type,
 *     discounts, and usage patterns. Always verify with the
 *     official AWS Pricing Calculator before making real decisions.
 *
 * Official AWS Pricing Calculator: https://calculator.aws/
 */

import type { AWSRegion, PricingStatus } from '../types';

export interface PriceEntry {
  service: string;
  region: AWSRegion;
  tier: string;
  pricingUnit: string;
  pricePerUnit: number;
  currency: 'USD';
  sourceUrl: string;
  lastVerified: string;
  status: PricingStatus;
  assumptions: string[];
}

/* ────────────────────────────────────────
   EC2 On-Demand Pricing (Linux)
   Source: https://aws.amazon.com/ec2/pricing/on-demand/
   ──────────────────────────────────────── */
const ec2Prices: PriceEntry[] = [
  {
    service: 'ec2',
    region: 'us-east-1',
    tier: 't3.micro',
    pricingUnit: 'per hour',
    pricePerUnit: 0.0104,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/ec2/pricing/on-demand/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'On-Demand pricing, no Reserved Instance or Savings Plan discount',
      'Linux/Unix operating system',
      'Does not include EBS storage, data transfer, or Elastic IP costs',
    ],
  },
  {
    service: 'ec2',
    region: 'us-east-1',
    tier: 't3.small',
    pricingUnit: 'per hour',
    pricePerUnit: 0.0208,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/ec2/pricing/on-demand/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'On-Demand pricing, no Reserved Instance or Savings Plan discount',
      'Linux/Unix operating system',
    ],
  },
  {
    service: 'ec2',
    region: 'us-east-1',
    tier: 't3.medium',
    pricingUnit: 'per hour',
    pricePerUnit: 0.0416,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/ec2/pricing/on-demand/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'On-Demand pricing, no Reserved Instance or Savings Plan discount',
      'Linux/Unix operating system',
    ],
  },
  {
    service: 'ec2',
    region: 'us-east-1',
    tier: 't3.large',
    pricingUnit: 'per hour',
    pricePerUnit: 0.0832,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/ec2/pricing/on-demand/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'On-Demand pricing, no Reserved Instance or Savings Plan discount',
      'Linux/Unix operating system',
    ],
  },
  // Windows is typically more expensive due to licensing
  {
    service: 'ec2',
    region: 'us-east-1',
    tier: 't3.micro-windows',
    pricingUnit: 'per hour',
    pricePerUnit: 0.0204,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/ec2/pricing/on-demand/',
    lastVerified: '2024-12-01',
    status: 'illustrative',
    assumptions: [
      'On-Demand pricing with Windows license',
      'Illustrative rate — verify on AWS Pricing page',
    ],
  },
  {
    service: 'ec2',
    region: 'us-east-1',
    tier: 't3.small-windows',
    pricingUnit: 'per hour',
    pricePerUnit: 0.0364,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/ec2/pricing/on-demand/',
    lastVerified: '2024-12-01',
    status: 'illustrative',
    assumptions: [
      'On-Demand pricing with Windows license',
      'Illustrative rate — verify on AWS Pricing page',
    ],
  },
  {
    service: 'ec2',
    region: 'us-east-1',
    tier: 't3.medium-windows',
    pricingUnit: 'per hour',
    pricePerUnit: 0.0572,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/ec2/pricing/on-demand/',
    lastVerified: '2024-12-01',
    status: 'illustrative',
    assumptions: [
      'On-Demand pricing with Windows license',
      'Illustrative rate — verify on AWS Pricing page',
    ],
  },
  {
    service: 'ec2',
    region: 'us-east-1',
    tier: 't3.large-windows',
    pricingUnit: 'per hour',
    pricePerUnit: 0.1144,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/ec2/pricing/on-demand/',
    lastVerified: '2024-12-01',
    status: 'illustrative',
    assumptions: [
      'On-Demand pricing with Windows license',
      'Illustrative rate — verify on AWS Pricing page',
    ],
  },
];

/* ────────────────────────────────────────
   S3 Pricing
   Source: https://aws.amazon.com/s3/pricing/
   ──────────────────────────────────────── */
const s3Prices: PriceEntry[] = [
  {
    service: 's3',
    region: 'us-east-1',
    tier: 'standard-storage',
    pricingUnit: 'per GB / month',
    pricePerUnit: 0.023,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/s3/pricing/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'S3 Standard storage class',
      'First 50 TB tier',
      'Does not include data transfer out or retrieval fees',
    ],
  },
  {
    service: 's3',
    region: 'us-east-1',
    tier: 'requests-put',
    pricingUnit: 'per 1,000 PUT requests',
    pricePerUnit: 0.005,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/s3/pricing/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'PUT, COPY, POST, LIST requests',
      'Does not include GET or SELECT requests',
    ],
  },
  {
    service: 's3',
    region: 'us-east-1',
    tier: 'requests-get',
    pricingUnit: 'per 1,000 GET requests',
    pricePerUnit: 0.0004,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/s3/pricing/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'GET and SELECT requests',
    ],
  },
];

/* ────────────────────────────────────────
   Lambda Pricing
   Source: https://aws.amazon.com/lambda/pricing/
   ──────────────────────────────────────── */
const lambdaPrices: PriceEntry[] = [
  {
    service: 'lambda',
    region: 'us-east-1',
    tier: 'requests',
    pricingUnit: 'per 1M requests',
    pricePerUnit: 0.20,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/lambda/pricing/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'Price per 1 million requests after free tier',
      'Free tier: 1M requests per month (not included in estimate)',
    ],
  },
  {
    service: 'lambda',
    region: 'us-east-1',
    tier: 'duration',
    pricingUnit: 'per GB-second',
    pricePerUnit: 0.0000166667,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/lambda/pricing/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'Price per GB-second of compute',
      'Free tier: 400,000 GB-seconds/month (not included in estimate)',
      'Billed in 1ms increments',
    ],
  },
];

/* ────────────────────────────────────────
   DynamoDB Pricing
   Source: https://aws.amazon.com/dynamodb/pricing/
   ──────────────────────────────────────── */
const dynamoDBPrices: PriceEntry[] = [
  {
    service: 'dynamodb',
    region: 'us-east-1',
    tier: 'write-request',
    pricingUnit: 'per 1M write request units',
    pricePerUnit: 1.25,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/dynamodb/pricing/on-demand/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'On-demand capacity mode',
      'Standard table class',
      '1 WRU = 1 write of up to 1 KB',
    ],
  },
  {
    service: 'dynamodb',
    region: 'us-east-1',
    tier: 'read-request',
    pricingUnit: 'per 1M read request units',
    pricePerUnit: 0.25,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/dynamodb/pricing/on-demand/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'On-demand capacity mode',
      'Eventually consistent reads',
      '1 RRU = 1 read of up to 4 KB',
    ],
  },
  {
    service: 'dynamodb',
    region: 'us-east-1',
    tier: 'storage',
    pricingUnit: 'per GB / month',
    pricePerUnit: 0.25,
    currency: 'USD',
    sourceUrl: 'https://aws.amazon.com/dynamodb/pricing/on-demand/',
    lastVerified: '2024-12-01',
    status: 'verified-sample',
    assumptions: [
      'First 25 GB is free (not deducted in this estimate)',
      'Standard storage pricing',
    ],
  },
];

/* ────────────────────────────────────────
   Public API for the pricing module
   ──────────────────────────────────────── */

/** All pricing entries, combined into one array */
export const ALL_PRICES: PriceEntry[] = [
  ...ec2Prices,
  ...s3Prices,
  ...lambdaPrices,
  ...dynamoDBPrices,
];

/**
 * Look up a specific price entry.
 *
 * Because we only store us-east-1 prices in v1, we fall back
 * to us-east-1 if the user's chosen region isn't in our data yet,
 * and flag the result as "needs-verification".
 */
export function getPrice(
  service: string,
  tier: string,
  region: AWSRegion,
): PriceEntry | null {
  // Try exact region match first
  let entry = ALL_PRICES.find(
    (p) => p.service === service && p.tier === tier && p.region === region,
  );

  if (entry) return entry;

  // Fall back to us-east-1 with a warning
  entry = ALL_PRICES.find(
    (p) => p.service === service && p.tier === tier && p.region === 'us-east-1',
  );

  if (entry) {
    return {
      ...entry,
      region,
      status: 'needs-verification',
      assumptions: [
        ...entry.assumptions,
        `Price from us-east-1 used as estimate — ${region} price may differ`,
      ],
    };
  }

  return null;
}

/**
 * Descriptive metadata about each service, shown in the UI
 */
export const SERVICE_META: Record<
  string,
  { name: string; description: string; icon: string; color: string }
> = {
  ec2: {
    name: 'Amazon EC2',
    description: 'Virtual servers in the cloud. Pay per running hour.',
    icon: 'Server',
    color: '#f59e0b',
  },
  s3: {
    name: 'Amazon S3',
    description: 'Scalable object storage. Pay per GB stored and requests.',
    icon: 'Database',
    color: '#22c55e',
  },
  lambda: {
    name: 'AWS Lambda',
    description: 'Run code without servers. Pay per invocation and duration.',
    icon: 'Zap',
    color: '#8b5cf6',
  },
  dynamodb: {
    name: 'Amazon DynamoDB',
    description: 'Managed NoSQL database. Pay per request and storage.',
    icon: 'Table2',
    color: '#3b82f6',
  },
};

/** Human-readable instance tier labels */
export const EC2_TIERS = [
  { value: 't3.micro', label: 't3.micro (2 vCPU, 1 GB RAM)' },
  { value: 't3.small', label: 't3.small (2 vCPU, 2 GB RAM)' },
  { value: 't3.medium', label: 't3.medium (2 vCPU, 4 GB RAM)' },
  { value: 't3.large', label: 't3.large (2 vCPU, 8 GB RAM)' },
];
