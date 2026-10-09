import { describe, it, expect } from 'vitest';
import { calculateServiceCost, calculateProjectCost } from './calculateCost';
import type { EC2Config, S3Config, LambdaConfig, DynamoDBConfig, ProjectService } from '../../types';

describe('calculateServiceCost', () => {
  it('correctly calculates EC2 cost for t3.micro on Linux running full month in us-east-1', () => {
    const config: EC2Config = {
      serviceType: 'ec2',
      instanceCount: 1,
      hoursPerMonth: 730,
      instanceTier: 't3.micro',
      operatingSystem: 'linux',
    };

    const result = calculateServiceCost(config, 'us-east-1');
    expect(result.serviceType).toBe('ec2');
    // In us-east-1, t3.micro is $0.0104/hr => 730 * 0.0104 = $7.592
    expect(result.monthlyCost).toBeCloseTo(7.592, 2);
    expect(result.pricingStatus).toBe('verified-sample');
    expect(result.breakdown.length).toBeGreaterThan(0);
  });

  it('correctly calculates S3 standard storage and request costs', () => {
    const config: S3Config = {
      serviceType: 's3',
      storageGB: 100,
      requestsPerMonth: 50000,
      storageClass: 'standard',
    };

    const result = calculateServiceCost(config, 'us-east-1');
    expect(result.serviceType).toBe('s3');
    // Storage: 100 * 0.023 = $2.30
    // Requests: (50000 / 1000) * 0.005 = $0.25
    // Total = $2.55
    expect(result.monthlyCost).toBeCloseTo(2.55, 2);
  });

  it('correctly calculates Lambda request and duration costs', () => {
    const config: LambdaConfig = {
      serviceType: 'lambda',
      invocationsPerMonth: 1_000_000,
      avgDurationMs: 200,
      memoryMB: 512,
    };

    const result = calculateServiceCost(config, 'us-east-1');
    expect(result.serviceType).toBe('lambda');
    // 1M requests * $0.20/1M = $0.20
    // 1M * (512/1024 GB) * 0.20s = 100,000 GB-seconds
    // 100,000 * $0.0000166667 = $1.66667
    // Total approx $1.86667
    expect(result.monthlyCost).toBeCloseTo(1.867, 2);
  });

  it('correctly calculates DynamoDB on-demand writes, reads, and storage', () => {
    const config: DynamoDBConfig = {
      serviceType: 'dynamodb',
      readRequestsPerMonth: 5_000_000,
      writeRequestsPerMonth: 1_000_000,
      storageGB: 10,
    };

    const result = calculateServiceCost(config, 'us-east-1');
    expect(result.serviceType).toBe('dynamodb');
    // Writes: 1M * $1.25/1M = $1.25
    // Reads: 5M * $0.25/1M = $1.25
    // Storage: 10 * $0.25 = $2.50
    // Total = $5.00
    expect(result.monthlyCost).toBeCloseTo(5.0, 2);
  });
});

describe('calculateProjectCost', () => {
  it('accurately aggregates monthly and annual costs across multiple services', () => {
    const services: ProjectService[] = [
      {
        id: '1',
        name: 'Web Server',
        config: {
          serviceType: 'ec2',
          instanceCount: 2,
          hoursPerMonth: 730,
          instanceTier: 't3.micro',
          operatingSystem: 'linux',
        },
      },
      {
        id: '2',
        name: 'Asset Storage',
        config: {
          serviceType: 's3',
          storageGB: 50,
          requestsPerMonth: 10000,
          storageClass: 'standard',
        },
      },
    ];

    const estimate = calculateProjectCost(services, 'us-east-1');
    expect(estimate.services).toHaveLength(2);
    // EC2: 2 * 730 * 0.0104 = 15.184
    // S3: 50 * 0.023 + 10 * 0.005 = 1.15 + 0.05 = 1.20
    // Total = 16.384
    expect(estimate.totalMonthlyCost).toBeCloseTo(16.384, 2);
    expect(estimate.totalAnnualCost).toBeCloseTo(16.384 * 12, 2);
  });
});
