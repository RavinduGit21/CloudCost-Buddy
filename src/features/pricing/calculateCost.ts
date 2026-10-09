/**
 * Cost Calculation Engine
 *
 * Pure functions that take a service config + region and return
 * a cost result.  These functions have NO side effects and NO
 * dependency on React — they just do math.
 *
 * Keeping the engine separate from the UI means:
 *   1. We can unit-test it easily.
 *   2. We can swap pricing data later without touching components.
 *   3. If we ever add a backend, we can move this module as-is.
 */

import type {
  AWSRegion,
  ServiceConfig,
  ServiceCostResult,
  CostEstimate,
  EC2Config,
  S3Config,
  LambdaConfig,
  DynamoDBConfig,
  ProjectService,
} from '../../types';
import { getPrice } from '../../data/pricingData';

/* ─── EC2 ─────────────────────────────────── */

function calculateEC2(config: EC2Config, region: AWSRegion): ServiceCostResult {
  const tierKey = config.operatingSystem === 'windows'
    ? `${config.instanceTier}-windows`
    : config.instanceTier;

  const priceEntry = getPrice('ec2', tierKey, region);
  const warnings: string[] = [];
  const assumptions: string[] = [];

  if (!priceEntry) {
    return {
      serviceType: 'ec2',
      monthlyCost: 0,
      breakdown: ['Unable to find pricing for this configuration'],
      assumptions: ['No matching price entry found'],
      pricingStatus: 'needs-verification',
      warnings: [`No pricing data available for ${config.instanceTier} in ${region}`],
    };
  }

  if (priceEntry.status !== 'verified-sample') {
    warnings.push('Price is illustrative — verify on the AWS pricing page before deployment.');
  }

  assumptions.push(...priceEntry.assumptions);

  const hourlyRate = priceEntry.pricePerUnit;
  const totalHours = config.instanceCount * config.hoursPerMonth;
  const monthlyCost = totalHours * hourlyRate;

  const breakdown = [
    `${config.instanceCount} instance(s) × ${config.hoursPerMonth} hrs/mo × $${hourlyRate}/hr`,
    `= $${monthlyCost.toFixed(4)}/month`,
  ];

  return {
    serviceType: 'ec2',
    monthlyCost,
    breakdown,
    assumptions,
    pricingStatus: priceEntry.status,
    warnings,
  };
}

/* ─── S3 ─────────────────────────────────── */

function calculateS3(config: S3Config, region: AWSRegion): ServiceCostResult {
  const storagePriceEntry = getPrice('s3', 'standard-storage', region);
  const putPriceEntry = getPrice('s3', 'requests-put', region);
  const warnings: string[] = [];
  const assumptions: string[] = [];

  if (!storagePriceEntry) {
    return {
      serviceType: 's3',
      monthlyCost: 0,
      breakdown: ['Unable to find pricing for this configuration'],
      assumptions: ['No matching price entry found'],
      pricingStatus: 'needs-verification',
      warnings: [`No pricing data available for S3 in ${region}`],
    };
  }

  assumptions.push(...storagePriceEntry.assumptions);

  const storageCost = config.storageGB * storagePriceEntry.pricePerUnit;
  const breakdown: string[] = [
    `Storage: ${config.storageGB} GB × $${storagePriceEntry.pricePerUnit}/GB = $${storageCost.toFixed(4)}`,
  ];

  let requestCost = 0;
  if (config.requestsPerMonth > 0 && putPriceEntry) {
    // Requests are priced per 1,000
    requestCost = (config.requestsPerMonth / 1000) * putPriceEntry.pricePerUnit;
    breakdown.push(
      `Requests: ${config.requestsPerMonth.toLocaleString()} × $${putPriceEntry.pricePerUnit}/1K = $${requestCost.toFixed(4)}`,
    );
    assumptions.push(...putPriceEntry.assumptions);
  }

  const monthlyCost = storageCost + requestCost;
  breakdown.push(`Total: $${monthlyCost.toFixed(4)}/month`);

  if (storagePriceEntry.status !== 'verified-sample') {
    warnings.push('Price is illustrative — verify on the AWS pricing page.');
  }

  return {
    serviceType: 's3',
    monthlyCost,
    breakdown,
    assumptions,
    pricingStatus: storagePriceEntry.status,
    warnings,
  };
}

/* ─── Lambda ─────────────────────────────── */

function calculateLambda(config: LambdaConfig, region: AWSRegion): ServiceCostResult {
  const requestPriceEntry = getPrice('lambda', 'requests', region);
  const durationPriceEntry = getPrice('lambda', 'duration', region);
  const warnings: string[] = [];
  const assumptions: string[] = [];

  if (!requestPriceEntry || !durationPriceEntry) {
    return {
      serviceType: 'lambda',
      monthlyCost: 0,
      breakdown: ['Unable to find pricing for this configuration'],
      assumptions: ['No matching price entry found'],
      pricingStatus: 'needs-verification',
      warnings: [`No pricing data available for Lambda in ${region}`],
    };
  }

  assumptions.push(...requestPriceEntry.assumptions);
  assumptions.push(...durationPriceEntry.assumptions);

  // Request cost: priced per 1M requests
  const requestCost = (config.invocationsPerMonth / 1_000_000) * requestPriceEntry.pricePerUnit;

  // Duration cost:
  // 1. Convert memory from MB to GB
  // 2. Convert duration from ms to seconds
  // 3. Compute total GB-seconds
  const memoryGB = config.memoryMB / 1024;
  const durationSec = config.avgDurationMs / 1000;
  const totalGBSeconds = config.invocationsPerMonth * memoryGB * durationSec;
  const durationCost = totalGBSeconds * durationPriceEntry.pricePerUnit;

  const monthlyCost = requestCost + durationCost;

  const breakdown = [
    `Requests: ${config.invocationsPerMonth.toLocaleString()} × $${requestPriceEntry.pricePerUnit}/1M = $${requestCost.toFixed(4)}`,
    `Duration: ${config.invocationsPerMonth.toLocaleString()} invocations × ${config.avgDurationMs}ms × ${config.memoryMB}MB`,
    `  = ${totalGBSeconds.toFixed(2)} GB-seconds × $${durationPriceEntry.pricePerUnit}/GB-s = $${durationCost.toFixed(4)}`,
    `Total: $${monthlyCost.toFixed(4)}/month`,
  ];

  if (requestPriceEntry.status !== 'verified-sample') {
    warnings.push('Price is illustrative — verify on the AWS pricing page.');
  }

  return {
    serviceType: 'lambda',
    monthlyCost,
    breakdown,
    assumptions,
    pricingStatus: requestPriceEntry.status,
    warnings,
  };
}

/* ─── DynamoDB ───────────────────────────── */

function calculateDynamoDB(config: DynamoDBConfig, region: AWSRegion): ServiceCostResult {
  const writePriceEntry = getPrice('dynamodb', 'write-request', region);
  const readPriceEntry = getPrice('dynamodb', 'read-request', region);
  const storagePriceEntry = getPrice('dynamodb', 'storage', region);
  const warnings: string[] = [];
  const assumptions: string[] = [];

  if (!writePriceEntry || !readPriceEntry || !storagePriceEntry) {
    return {
      serviceType: 'dynamodb',
      monthlyCost: 0,
      breakdown: ['Unable to find pricing for this configuration'],
      assumptions: ['No matching price entry found'],
      pricingStatus: 'needs-verification',
      warnings: [`No pricing data available for DynamoDB in ${region}`],
    };
  }

  assumptions.push(...writePriceEntry.assumptions);
  assumptions.push(...readPriceEntry.assumptions);
  assumptions.push(...storagePriceEntry.assumptions);

  // Write cost: priced per 1M WRUs
  const writeCost = (config.writeRequestsPerMonth / 1_000_000) * writePriceEntry.pricePerUnit;
  // Read cost: priced per 1M RRUs
  const readCost = (config.readRequestsPerMonth / 1_000_000) * readPriceEntry.pricePerUnit;
  // Storage cost
  const storageCost = config.storageGB * storagePriceEntry.pricePerUnit;

  const monthlyCost = writeCost + readCost + storageCost;

  const breakdown = [
    `Writes: ${config.writeRequestsPerMonth.toLocaleString()} WRUs × $${writePriceEntry.pricePerUnit}/1M = $${writeCost.toFixed(4)}`,
    `Reads: ${config.readRequestsPerMonth.toLocaleString()} RRUs × $${readPriceEntry.pricePerUnit}/1M = $${readCost.toFixed(4)}`,
    `Storage: ${config.storageGB} GB × $${storagePriceEntry.pricePerUnit}/GB = $${storageCost.toFixed(4)}`,
    `Total: $${monthlyCost.toFixed(4)}/month`,
  ];

  if (writePriceEntry.status !== 'verified-sample') {
    warnings.push('Price is illustrative — verify on the AWS pricing page.');
  }

  return {
    serviceType: 'dynamodb',
    monthlyCost,
    breakdown,
    assumptions,
    pricingStatus: writePriceEntry.status,
    warnings,
  };
}

/* ─── Public API ─────────────────────────── */

/**
 * Calculate cost for a single service configuration
 */
export function calculateServiceCost(
  config: ServiceConfig,
  region: AWSRegion,
): ServiceCostResult {
  switch (config.serviceType) {
    case 'ec2':
      return calculateEC2(config, region);
    case 's3':
      return calculateS3(config, region);
    case 'lambda':
      return calculateLambda(config, region);
    case 'dynamodb':
      return calculateDynamoDB(config, region);
    default:
      return {
        serviceType: 'ec2',
        monthlyCost: 0,
        breakdown: ['Unknown service type'],
        assumptions: [],
        pricingStatus: 'needs-verification',
        warnings: ['Unrecognised service type'],
      };
  }
}

/**
 * Calculate the complete cost estimate for a project
 * (i.e., run calculateServiceCost for every service in the project)
 */
export function calculateProjectCost(
  services: ProjectService[],
  region: AWSRegion,
): CostEstimate {
  const results = services.map((s) => calculateServiceCost(s.config, region));
  const totalMonthlyCost = results.reduce((sum, r) => sum + r.monthlyCost, 0);

  return {
    totalMonthlyCost,
    totalAnnualCost: totalMonthlyCost * 12,
    services: results,
  };
}
