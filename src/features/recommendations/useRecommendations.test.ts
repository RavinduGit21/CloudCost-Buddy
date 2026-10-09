import { describe, it, expect } from 'vitest';
import { generateRecommendations } from './useRecommendations';
import type { Project, CostEstimate } from '../../types';

describe('generateRecommendations', () => {
  it('generates high-priority Reserved Instance recommendation for 24/7 EC2', () => {
    const project: Project = {
      id: 'proj-1',
      name: 'Production Web App',
      description: 'Production setup',
      region: 'us-east-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '',
      services: [
        {
          id: 'svc-1',
          config: {
            serviceType: 'ec2',
            instanceCount: 1,
            hoursPerMonth: 730,
            instanceTier: 't3.micro',
            operatingSystem: 'linux',
          },
        },
      ],
    };

    const estimate: CostEstimate = {
      totalMonthlyCost: 7.592,
      totalAnnualCost: 91.1,
      services: [
        {
          serviceType: 'ec2',
          monthlyCost: 7.592,
          breakdown: ['test'],
          assumptions: ['test'],
          pricingStatus: 'verified-sample',
          warnings: [],
        },
      ],
    };

    const recs = generateRecommendations(project, estimate);
    expect(recs.length).toBeGreaterThan(0);
    const ec2Rec = recs.find((r) => r.serviceType === 'ec2');
    expect(ec2Rec).toBeDefined();
    expect(ec2Rec?.title).toContain('24/7');
    expect(ec2Rec?.potentialSavings).toBeDefined();
    expect(ec2Rec?.potentialSavings?.amount).toBeCloseTo(7.592 * 0.3, 2);
  });

  it('suggests lifecycle transitions when S3 storage is large (> 50GB)', () => {
    const project: Project = {
      id: 'proj-2',
      name: 'Media Vault',
      description: 'Large storage',
      region: 'us-east-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: '',
      services: [
        {
          id: 'svc-s3',
          config: {
            serviceType: 's3',
            storageGB: 200,
            requestsPerMonth: 5000,
          },
        },
      ],
    };

    const estimate: CostEstimate = {
      totalMonthlyCost: 2.325,
      totalAnnualCost: 27.9,
      services: [
        {
          serviceType: 's3',
          monthlyCost: 2.325,
          breakdown: ['test'],
          assumptions: ['test'],
          pricingStatus: 'verified-sample',
          warnings: [],
        },
      ],
    };

    const recs = generateRecommendations(project, estimate);
    const s3Rec = recs.find((r) => r.serviceType === 's3');
    expect(s3Rec).toBeDefined();
    expect(s3Rec?.title).toContain('lifecycle');
  });
});
