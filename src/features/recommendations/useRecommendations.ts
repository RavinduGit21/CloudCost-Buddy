/**
 * Rule-Based Recommendation Engine
 *
 * Analyses a project's services and generates optimisation tips.
 * Every rule is transparent: the user can see WHY the tip appears
 * and WHAT they should investigate.
 *
 * No AI, no magic — just sensible if-then checks.
 */

import type { Project, Recommendation, CostEstimate } from '../../types';
import { SERVICE_META } from '../../data/pricingData';

let recId = 0;
function nextId(): string {
  return `rec-${++recId}`;
}

export function generateRecommendations(
  project: Project,
  estimate: CostEstimate,
): Recommendation[] {
  const recs: Recommendation[] = [];
  recId = 0; // reset per call

  for (const svc of project.services) {
    const cfg = svc.config;

    /* ── EC2 Rules ── */
    if (cfg.serviceType === 'ec2') {
      // Rule: Running 24/7
      if (cfg.hoursPerMonth >= 720) {
        recs.push({
          id: nextId(),
          serviceType: 'ec2',
          title: 'EC2 running 24/7 — consider Reserved Instances',
          description:
            'Your EC2 instance is configured to run ~730 hours/month (full-time). ' +
            'If this is a production workload, Reserved Instances or Savings Plans ' +
            'could reduce cost by up to ~30–72%. If this is a dev/test server, ' +
            'consider stopping it outside working hours.',
          actionItems: [
            'Review whether this instance needs to run 24/7',
            'Explore EC2 Reserved Instances on the AWS Pricing page',
            'Look into AWS Savings Plans for flexible commitments',
            'For dev/test, consider using Instance Scheduler or a cron job to stop overnight',
          ],
          potentialSavings: {
            amount:
              estimate.services.find((s) => s.serviceType === 'ec2')!.monthlyCost * 0.3,
            assumption:
              'Estimated 30% saving if you switch to a 1-year No Upfront Reserved Instance (illustrative)',
          },
          priority: 'high',
        });
      }

      // Rule: Dev/test instance running many hours
      if (cfg.hoursPerMonth >= 400 && cfg.hoursPerMonth < 720) {
        recs.push({
          id: nextId(),
          serviceType: 'ec2',
          title: 'EC2 running long hours — review scheduling',
          description:
            'Your instance runs ~' + cfg.hoursPerMonth + ' hours/month. ' +
            'If this is a development or testing workload, you may be able to ' +
            'reduce costs by running it only during business hours.',
          actionItems: [
            'Calculate how many hours you actually need',
            'Stop idle instances when not in use',
            'Consider AWS Instance Scheduler for automatic stop/start',
          ],
          priority: 'medium',
        });
      }

      // Rule: Multiple instances
      if (cfg.instanceCount > 1) {
        recs.push({
          id: nextId(),
          serviceType: 'ec2',
          title: 'Multiple EC2 instances configured',
          description:
            `You have ${cfg.instanceCount} instances. Consider whether you need all of them ` +
            'simultaneously, or if an Auto Scaling Group could help you scale up and down.',
          actionItems: [
            'Review if all instances are needed at once',
            'Consider EC2 Auto Scaling to match capacity to demand',
            'Evaluate using Spot Instances for fault-tolerant workloads',
          ],
          priority: 'low',
        });
      }
    }

    /* ── S3 Rules ── */
    if (cfg.serviceType === 's3') {
      if (cfg.storageGB > 100) {
        recs.push({
          id: nextId(),
          serviceType: 's3',
          title: 'Large S3 storage — review lifecycle policies',
          description:
            `You plan to store ${cfg.storageGB} GB. Consider S3 Lifecycle Rules ` +
            'to automatically move older data to cheaper storage classes like ' +
            'S3 Intelligent-Tiering, Glacier Instant Retrieval, or Glacier.',
          actionItems: [
            'Identify data access patterns (hot vs. cold)',
            'Set up S3 Lifecycle Rules for automatic transitions',
            'Review S3 Storage Classes on the AWS documentation',
            'Enable S3 Intelligent-Tiering for unknown access patterns',
          ],
          priority: 'medium',
        });
      }

      recs.push({
        id: nextId(),
        serviceType: 's3',
        title: 'Review S3 storage class and data transfer',
        description:
          'This estimate uses S3 Standard pricing. Depending on your access ' +
          'pattern, a different storage class may be cheaper. Also note that ' +
          'data transfer out from S3 incurs additional charges not included here.',
        actionItems: [
          'Check if S3 Intelligent-Tiering or S3 Infrequent Access fits your needs',
          'Estimate data transfer out costs if serving files to the internet',
          'Consider using CloudFront CDN to reduce transfer costs',
        ],
        priority: 'low',
      });
    }

    /* ── Lambda Rules ── */
    if (cfg.serviceType === 'lambda') {
      if (cfg.invocationsPerMonth > 10_000_000) {
        recs.push({
          id: nextId(),
          serviceType: 'lambda',
          title: 'High Lambda invocation volume',
          description:
            `${(cfg.invocationsPerMonth / 1_000_000).toFixed(1)}M invocations/month is significant. ` +
            'At this scale, review whether Lambda is still the most cost-effective option ' +
            'compared to a containerised workload (ECS Fargate or EC2).',
          actionItems: [
            'Compare Lambda cost with ECS Fargate for sustained workloads',
            'Optimise function duration by profiling code',
            'Review memory allocation — sometimes more memory = faster = cheaper',
            'Check if Lambda Power Tuning can help find optimal settings',
          ],
          priority: 'high',
        });
      }

      if (cfg.memoryMB > 512) {
        recs.push({
          id: nextId(),
          serviceType: 'lambda',
          title: 'Lambda memory is set above 512 MB',
          description:
            `Memory is set to ${cfg.memoryMB} MB. Higher memory also allocates more ` +
            'CPU proportionally. If your function doesn\'t need this, reducing memory ' +
            'will lower cost. But sometimes MORE memory finishes faster and costs LESS.',
          actionItems: [
            'Profile your function to find the optimal memory setting',
            'Use AWS Lambda Power Tuning to test different memory sizes',
            'Check CloudWatch Logs for "Max Memory Used"',
          ],
          priority: 'medium',
        });
      }
    }

    /* ── DynamoDB Rules ── */
    if (cfg.serviceType === 'dynamodb') {
      if (cfg.writeRequestsPerMonth > 1_000_000 || cfg.readRequestsPerMonth > 1_000_000) {
        recs.push({
          id: nextId(),
          serviceType: 'dynamodb',
          title: 'High DynamoDB request volume — review capacity mode',
          description:
            'With over 1M requests/month, compare On-Demand vs. Provisioned Capacity. ' +
            'On-Demand is simpler but more expensive per request at high volumes. ' +
            'Provisioned with Auto Scaling may save cost for predictable workloads.',
          actionItems: [
            'Evaluate whether your traffic is predictable or spiky',
            'If predictable, switch to Provisioned Capacity with Auto Scaling',
            'Review DynamoDB pricing modes in the AWS documentation',
          ],
          priority: 'medium',
        });
      }

      if (cfg.storageGB > 25) {
        recs.push({
          id: nextId(),
          serviceType: 'dynamodb',
          title: 'DynamoDB storage exceeds free tier',
          description:
            `You plan to store ${cfg.storageGB} GB. The first 25 GB of DynamoDB ` +
            'storage is included in the free tier (for the first 12 months). ' +
            'Beyond that, you pay per GB/month.',
          actionItems: [
            'Consider whether all data needs to stay in DynamoDB',
            'Archive old items to S3 via DynamoDB export or TTL',
            'Check the DynamoDB free tier terms for your account',
          ],
          priority: 'low',
        });
      }
    }
  }

  /* ── General Rules ── */

  // Rule: One service dominates cost
  if (estimate.services.length > 1) {
    const sorted = [...estimate.services].sort((a, b) => b.monthlyCost - a.monthlyCost);
    const topShare = sorted[0].monthlyCost / estimate.totalMonthlyCost;
    if (topShare > 0.7) {
      const meta = SERVICE_META[sorted[0].serviceType];
      recs.push({
        id: nextId(),
        serviceType: 'general',
        title: `${meta.name} dominates your estimate (${(topShare * 100).toFixed(0)}%)`,
        description:
          `${meta.name} accounts for most of your estimated cost. ` +
          'Optimising this one service will have the biggest impact on your total.',
        actionItems: [
          `Focus optimisation efforts on ${meta.name}`,
          'Review the configuration and consider alternative approaches',
          'Use the official AWS Pricing Calculator for a more detailed estimate',
        ],
        priority: 'high',
      });
    }
  }

  // Rule: Any illustrative pricing?
  const hasIllustrative = estimate.services.some(
    (s) => s.pricingStatus !== 'verified-sample',
  );
  if (hasIllustrative) {
    recs.push({
      id: nextId(),
      serviceType: 'general',
      title: 'Some prices are illustrative — verify before deployment',
      description:
        'One or more services in this estimate use illustrative or unverified pricing. ' +
        'The actual cost may differ. Always cross-check with the official AWS Pricing Calculator.',
      actionItems: [
        'Visit https://calculator.aws/ for official estimates',
        'Check the AWS Pricing page for each service',
        'Review your AWS free tier eligibility',
      ],
      priority: 'medium',
    });
  }

  return recs;
}
