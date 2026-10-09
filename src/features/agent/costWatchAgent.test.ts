import { describe, it, expect } from 'vitest';
import { runCostWatchAudit } from './costWatchAgent';
import type { Project } from '../../types';

describe('runCostWatchAudit', () => {
  const sampleOverBudgetProject: Project = {
    id: 'proj-1',
    name: 'E-Commerce Platform',
    description: 'Online Store',
    region: 'us-east-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: '',
    services: [
      {
        id: 's1',
        config: {
          serviceType: 'ec2',
          instanceCount: 2,
          hoursPerMonth: 726,
          instanceTier: 't3.micro',
          operatingSystem: 'linux',
        },
      },
      {
        id: 's2',
        config: {
          serviceType: 's3',
          storageGB: 100,
          requestsPerMonth: 10000,
        },
      },
    ],
  };

  const sampleUnderBudgetProject: Project = {
    id: 'proj-2',
    name: 'Static Docs',
    description: 'Documentation site',
    region: 'us-east-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: '',
    services: [
      {
        id: 's3',
        config: {
          serviceType: 's3',
          storageGB: 10,
          requestsPerMonth: 5000,
        },
      },
    ],
  };

  it('correctly flags BREACHED status when cost exceeds the budget limit', () => {
    // EC2 cost is ~15.10 + S3 cost is ~2.35 = ~$17.45
    // With budget limit of $10.00, it should be BREACHED
    const report = runCostWatchAudit([sampleOverBudgetProject], 10.0);

    expect(report.totalProjectsAudited).toBe(1);
    expect(report.breachedCount).toBe(1);
    expect(report.healthyCount).toBe(0);

    const result = report.projectResults[0];
    expect(result.status).toBe('BREACHED');
    expect(result.varianceUSD).toBeGreaterThan(0);
    expect(result.topDriver?.serviceType).toBe('ec2');
    expect(result.remediations.length).toBeGreaterThan(0);
  });

  it('correctly flags HEALTHY status when cost is well below budget limit', () => {
    // S3 docs site is ~$0.26/month, well under $15.00 limit
    const report = runCostWatchAudit([sampleUnderBudgetProject], 15.0);

    expect(report.totalProjectsAudited).toBe(1);
    expect(report.healthyCount).toBe(1);
    expect(report.breachedCount).toBe(0);

    const result = report.projectResults[0];
    expect(result.status).toBe('HEALTHY');
    expect(result.varianceUSD).toBeLessThan(0);
  });

  it('correctly flags WARNING status when cost is within 10% warning threshold', () => {
    // Project cost is ~$17.45. If budget limit is $18.50, buffer is $18.50 * 0.9 = $16.65.
    // 17.45 is >= 16.65 and <= 18.50, triggering WARNING
    const report = runCostWatchAudit([sampleOverBudgetProject], 18.5);

    expect(report.warningCount).toBe(1);
    expect(report.projectResults[0].status).toBe('WARNING');
  });

  it('handles empty project collections gracefully', () => {
    const report = runCostWatchAudit([], 20.0);

    expect(report.totalProjectsAudited).toBe(0);
    expect(report.breachedCount).toBe(0);
    expect(report.healthyCount).toBe(0);
    expect(report.agentSummary).toContain('No architecture projects found');
  });
});
