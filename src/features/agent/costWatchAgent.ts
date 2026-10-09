/**
 * Cost Watch Agent Engine
 *
 * An autonomous goal-driven monitoring agent.
 *
 * How it functions:
 * 1. Perception: Inspects projects, service configurations, and calculates live costs.
 * 2. Goal/Policy: Compares projected monthly cost against user-configured budget limits.
 * 3. Reasoning: Evaluates variances, flags status (HEALTHY, WARNING, BREACHED),
 *    identifies the primary cost culprit, and synthesizes a remediation roadmap.
 * 4. Output: Produces a structured, timestamped audit report with actionable steps.
 *
 * Academic Classification:
 * A Goal-Based Heuristic Software Agent (Russell & Norvig, "AIMA").
 * Deterministic and transparent: zero API fees, zero pricing hallucinations.
 */

import type { Project, ServiceType } from '../../types';
import { calculateProjectCost } from '../pricing/calculateCost';
import { generateRecommendations } from '../recommendations/useRecommendations';
import { SERVICE_META } from '../../data/pricingData';

export type AuditStatus = 'HEALTHY' | 'WARNING' | 'BREACHED';

export interface RemediationStep {
  title: string;
  serviceType: ServiceType | 'general';
  estimatedSavingsUSD: number;
  projectedNewCostUSD: number;
  bringsUnderBudget: boolean;
  actionItems: string[];
}

export interface ProjectAuditResult {
  projectId: string;
  projectName: string;
  region: string;
  monthlyCostUSD: number;
  budgetLimitUSD: number;
  varianceUSD: number;
  variancePct: number;
  status: AuditStatus;
  topDriver: {
    serviceType: ServiceType;
    serviceName: string;
    monthlyCostUSD: number;
    shareOfTotalPct: number;
  } | null;
  remediations: RemediationStep[];
  notes: string;
}

export interface CostWatchReport {
  id: string;
  timestamp: string;
  budgetLimitUSD: number;
  totalProjectsAudited: number;
  healthyCount: number;
  warningCount: number;
  breachedCount: number;
  highestCostProject: {
    name: string;
    costUSD: number;
  } | null;
  projectResults: ProjectAuditResult[];
  agentSummary: string;
}

/**
 * Runs the Cost Watch Agent audit across an array of architecture projects.
 *
 * @param projects The saved architectural estimates to inspect.
 * @param budgetLimitUSD The monthly target ceiling (e.g. $20.00).
 * @param warningThresholdPct Percentage buffer before limit (default 10%, i.e. 90-100% of budget triggers WARNING).
 */
export function runCostWatchAudit(
  projects: Project[],
  budgetLimitUSD: number,
  warningThresholdPct = 10,
): CostWatchReport {
  const now = new Date().toISOString();
  const safeLimit = Math.max(0.01, budgetLimitUSD);

  let healthyCount = 0;
  let warningCount = 0;
  let breachedCount = 0;
  let highestCostProject: { name: string; costUSD: number } | null = null;

  const projectResults: ProjectAuditResult[] = projects.map((project) => {
    const costEstimate = calculateProjectCost(project.services, project.region);
    const monthlyCost = parseFloat(costEstimate.totalMonthlyCost.toFixed(2));
    const varianceUSD = parseFloat((monthlyCost - safeLimit).toFixed(2));
    const variancePct = parseFloat(((varianceUSD / safeLimit) * 100).toFixed(1));

    if (!highestCostProject || monthlyCost > highestCostProject.costUSD) {
      highestCostProject = { name: project.name, costUSD: monthlyCost };
    }

    // Determine status
    let status: AuditStatus = 'HEALTHY';
    const warningBuffer = safeLimit * (1 - warningThresholdPct / 100);

    if (monthlyCost > safeLimit) {
      status = 'BREACHED';
      breachedCount++;
    } else if (monthlyCost >= warningBuffer) {
      status = 'WARNING';
      warningCount++;
    } else {
      healthyCount++;
    }

    // Identify primary cost driver
    let topDriver: ProjectAuditResult['topDriver'] = null;
    if (costEstimate.services.length > 0 && monthlyCost > 0) {
      const sorted = [...costEstimate.services].sort((a, b) => b.monthlyCost - a.monthlyCost);
      const top = sorted[0];
      topDriver = {
        serviceType: top.serviceType,
        serviceName: SERVICE_META[top.serviceType]?.name ?? top.serviceType,
        monthlyCostUSD: parseFloat(top.monthlyCost.toFixed(2)),
        shareOfTotalPct: Math.round((top.monthlyCost / monthlyCost) * 100),
      };
    }

    // Synthesize remediation roadmap using recommendations
    const recs = generateRecommendations(project, costEstimate);
    const remediations: RemediationStep[] = recs.map((rec) => {
      const estimatedSavings = parseFloat((rec.potentialSavings?.amount ?? 0).toFixed(2));
      const projectedNewCost = parseFloat(Math.max(0, monthlyCost - estimatedSavings).toFixed(2));
      const bringsUnderBudget = projectedNewCost <= safeLimit;

      return {
        title: rec.title,
        serviceType: rec.serviceType,
        estimatedSavingsUSD: estimatedSavings,
        projectedNewCostUSD: projectedNewCost,
        bringsUnderBudget,
        actionItems: rec.actionItems,
      };
    });

    let notes = '';
    if (status === 'BREACHED') {
      notes = `Exceeds monthly budget ceiling by $${varianceUSD.toFixed(2)} (+${variancePct}%). Immediate optimization recommended.`;
    } else if (status === 'WARNING') {
      notes = `Within ${warningThresholdPct}% of budget limit. Monitor for usage expansion.`;
    } else {
      notes = `Spending is comfortably within the $${safeLimit.toFixed(2)} monthly ceiling.`;
    }

    return {
      projectId: project.id,
      projectName: project.name,
      region: project.region,
      monthlyCostUSD: monthlyCost,
      budgetLimitUSD: safeLimit,
      varianceUSD,
      variancePct,
      status,
      topDriver,
      remediations,
      notes,
    };
  });

  // Overall executive summary
  let agentSummary = '';
  if (projects.length === 0) {
    agentSummary = 'No architecture projects found. Create an estimate or launch a template to begin monitoring.';
  } else if (breachedCount > 0) {
    agentSummary = `Cost Watch Alert: ${breachedCount} of ${projects.length} project(s) breached the $${safeLimit.toFixed(2)} monthly budget limit. Review remediations below to bring infrastructure back under limit.`;
  } else if (warningCount > 0) {
    agentSummary = `Budget Notice: All projects are within budget, but ${warningCount} project(s) are approaching the $${safeLimit.toFixed(2)} limit.`;
  } else {
    agentSummary = `All ${projects.length} architectural estimate(s) are operating comfortably within the $${safeLimit.toFixed(2)} budget ceiling.`;
  }

  return {
    id: `audit-${Date.now()}`,
    timestamp: now,
    budgetLimitUSD: safeLimit,
    totalProjectsAudited: projects.length,
    healthyCount,
    warningCount,
    breachedCount,
    highestCostProject,
    projectResults,
    agentSummary,
  };
}
