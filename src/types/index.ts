/**
 * Core type definitions for CloudCost Buddy
 *
 * These types define the shape of all our data.
 * Think of them as a blueprint – they don't contain logic,
 * but they tell TypeScript (and us) exactly what every
 * object should look like.
 */

/** The four AWS services we support in version 1 */
export type ServiceType = 'ec2' | 's3' | 'lambda' | 'dynamodb';

/** Which AWS regions we allow the user to pick */
export type AWSRegion =
  | 'us-east-1'
  | 'us-west-2'
  | 'eu-west-1'
  | 'ap-southeast-1';

/** Friendly labels for regions */
export const REGION_LABELS: Record<AWSRegion, string> = {
  'us-east-1': 'US East (N. Virginia)',
  'us-west-2': 'US West (Oregon)',
  'eu-west-1': 'Europe (Ireland)',
  'ap-southeast-1': 'Asia Pacific (Singapore)',
};

/** How confident are we in this price? */
export type PricingStatus = 'verified-sample' | 'illustrative' | 'needs-verification';

/* ─────────── Service Configuration Types ─────────── */

export interface EC2Config {
  serviceType: 'ec2';
  instanceCount: number;
  hoursPerMonth: number;
  /** e.g. "t3.micro", "t3.small", "t3.medium", "t3.large" */
  instanceTier: string;
  operatingSystem: 'linux' | 'windows';
}

export interface S3Config {
  serviceType: 's3';
  storageGB: number;
  requestsPerMonth: number;
}

export interface LambdaConfig {
  serviceType: 'lambda';
  invocationsPerMonth: number;
  avgDurationMs: number;
  memoryMB: number;
}

export interface DynamoDBConfig {
  serviceType: 'dynamodb';
  readRequestsPerMonth: number;
  writeRequestsPerMonth: number;
  storageGB: number;
}

/** Union of all possible service configs */
export type ServiceConfig = EC2Config | S3Config | LambdaConfig | DynamoDBConfig;

/* ─────────── Cost Result Types ─────────── */

/** The result of calculating cost for one service */
export interface ServiceCostResult {
  serviceType: ServiceType;
  monthlyCost: number;
  /** Human-readable breakdown, e.g. "2 instances × 730 hrs × $0.0104/hr" */
  breakdown: string[];
  /** Assumptions that went into this calc */
  assumptions: string[];
  /** How reliable is this price? */
  pricingStatus: PricingStatus;
  /** Warnings, e.g. "Price not verified for this region" */
  warnings: string[];
}

/** The complete cost estimate for a project */
export interface CostEstimate {
  totalMonthlyCost: number;
  totalAnnualCost: number;
  services: ServiceCostResult[];
}

/* ─────────── Project / Saved Estimate ─────────── */

/** One configured service within a project */
export interface ProjectService {
  id: string;
  config: ServiceConfig;
}

/** A saved project (persisted in localStorage) */
export interface Project {
  id: string;
  name: string;
  description: string;
  region: AWSRegion;
  services: ProjectService[];
  notes: string;
  createdAt: string;   // ISO date string
  updatedAt: string;   // ISO date string
}

/* ─────────── Recommendation ─────────── */

export interface Recommendation {
  id: string;
  serviceType: ServiceType | 'general';
  title: string;
  description: string;
  /** What should the user investigate next? */
  actionItems: string[];
  /** Only set if we can calculate savings from stated assumptions */
  potentialSavings?: {
    amount: number;
    assumption: string;
  };
  priority: 'high' | 'medium' | 'low';
}

/* ─────────── Navigation ─────────── */

export type AppView = 'dashboard' | 'create' | 'edit' | 'learn' | 'templates' | 'saved';
