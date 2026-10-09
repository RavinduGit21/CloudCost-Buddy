/**
 * CreateEstimate Page
 *
 * Handles both "create new" and "edit existing" estimates.
 * If `existingProject` is passed, we pre-fill the form.
 *
 * Layout:
 *   Left column  → project details + service forms
 *   Right column → live cost breakdown + recommendations
 */

import { useState, useMemo, useCallback } from 'react';
import {
  PlusCircle,
  X,
  ChevronDown,
  ChevronUp,
  Save,
  ArrowLeft,
  Server,
  Database,
  Zap,
  Table2,
  AlertTriangle,
  Lightbulb,
  Info,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import type {
  Project,
  ProjectService,
  ServiceType,
  AWSRegion,
  EC2Config,
  S3Config,
  LambdaConfig,
  DynamoDBConfig,
  ServiceConfig,
  Recommendation,
} from '../types';
import { REGION_LABELS } from '../types';
import { calculateProjectCost } from '../features/pricing/calculateCost';
import { generateRecommendations } from '../features/recommendations/useRecommendations';
import { exportProjectJSON, exportProjectCSV } from '../features/storage/estimateStorage';
import { SERVICE_META, EC2_TIERS } from '../data/pricingData';
import { formatCurrency, generateId } from '../lib/utils';

interface CreateEstimateProps {
  existingProject: Project | null;
  onSave: (project: Project) => void;
  onCancel: () => void;
}


/* ─── Default configs for each service ─── */

function defaultEC2(): EC2Config {
  return {
    serviceType: 'ec2',
    instanceCount: 1,
    hoursPerMonth: 730,
    instanceTier: 't3.micro',
    operatingSystem: 'linux',
  };
}

function defaultS3(): S3Config {
  return {
    serviceType: 's3',
    storageGB: 10,
    requestsPerMonth: 10000,
  };
}

function defaultLambda(): LambdaConfig {
  return {
    serviceType: 'lambda',
    invocationsPerMonth: 1000000,
    avgDurationMs: 200,
    memoryMB: 128,
  };
}

function defaultDynamoDB(): DynamoDBConfig {
  return {
    serviceType: 'dynamodb',
    readRequestsPerMonth: 100000,
    writeRequestsPerMonth: 50000,
    storageGB: 5,
  };
}

function getDefaultConfig(type: ServiceType): ServiceConfig {
  switch (type) {
    case 'ec2': return defaultEC2();
    case 's3': return defaultS3();
    case 'lambda': return defaultLambda();
    case 'dynamodb': return defaultDynamoDB();
  }
}

/* ─── Icons per service ─── */
const SERVICE_ICONS: Record<ServiceType, React.ReactNode> = {
  ec2: <Server size={18} />,
  s3: <Database size={18} />,
  lambda: <Zap size={18} />,
  dynamodb: <Table2 size={18} />,
};

/* ================================================================== */

export default function CreateEstimate({ existingProject, onSave, onCancel }: CreateEstimateProps) {
  const isEditing = !!existingProject;

  const [name, setName] = useState(existingProject?.name ?? '');
  const [description, setDescription] = useState(existingProject?.description ?? '');
  const [region, setRegion] = useState<AWSRegion>(existingProject?.region ?? 'us-east-1');
  const [services, setServices] = useState<ProjectService[]>(
    existingProject?.services ?? [],
  );
  const [notes, setNotes] = useState(existingProject?.notes ?? '');
  const [expandedService, setExpandedService] = useState<string | null>(
    existingProject?.services?.[0]?.id ?? null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ── Live cost calculation ── */
  const estimate = useMemo(
    () => calculateProjectCost(services, region),
    [services, region],
  );

  /* ── Recommendations ── */
  const recommendations = useMemo(() => {
    if (services.length === 0) return [];
    const tempProject: Project = {
      id: 'temp',
      name,
      description,
      region,
      services,
      notes,
      createdAt: '',
      updatedAt: '',
    };
    return generateRecommendations(tempProject, estimate);
  }, [services, region, estimate, name, description, notes]);

  /* ── Pie chart data ── */
  const pieData = useMemo(
    () =>
      estimate.services
        .filter((s) => s.monthlyCost > 0)
        .map((s) => ({
          name: SERVICE_META[s.serviceType]?.name ?? s.serviceType,
          value: parseFloat(s.monthlyCost.toFixed(2)),
          color: SERVICE_META[s.serviceType]?.color ?? '#94a3b8',
        })),
    [estimate],
  );

  /* ── Add a service ── */
  const handleAddService = useCallback((type: ServiceType) => {
    const newService: ProjectService = {
      id: generateId(),
      config: getDefaultConfig(type),
    };
    setServices((prev) => [...prev, newService]);
    setExpandedService(newService.id);
  }, []);

  /* ── Remove a service ── */
  const handleRemoveService = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (expandedService === id) setExpandedService(null);
  }, [expandedService]);

  /* ── Update a service config ── */
  const handleUpdateService = useCallback(
    (id: string, updatedConfig: ServiceConfig) => {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, config: updatedConfig } : s)),
      );
    },
    [],
  );

  /* ── Validation & save ── */
  const handleSave = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Project name is required.';
    if (services.length === 0) newErrors.services = 'Add at least one AWS service.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const now = new Date().toISOString();
    const project: Project = {
      id: existingProject?.id ?? generateId(),
      name: name.trim(),
      description: description.trim(),
      region,
      services,
      notes: notes.trim(),
      createdAt: existingProject?.createdAt ?? now,
      updatedAt: now,
    };
    onSave(project);
  }, [name, description, region, services, notes, existingProject, onSave]);

  /* ── Export helpers ── */
  const handleExportJSON = () => {
    const project: Project = {
      id: existingProject?.id ?? generateId(),
      name: name.trim() || 'Untitled',
      description: description.trim(),
      region,
      services,
      notes: notes.trim(),
      createdAt: existingProject?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    exportProjectJSON(project);
  };

  const handleExportCSV = () => {
    const project: Project = {
      id: existingProject?.id ?? generateId(),
      name: name.trim() || 'Untitled',
      description: description.trim(),
      region,
      services,
      notes: notes.trim(),
      createdAt: existingProject?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    exportProjectCSV(
      project,
      estimate.services.map((s) => ({
        service: SERVICE_META[s.serviceType]?.name ?? s.serviceType,
        monthlyCost: s.monthlyCost,
      })),
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-text-primary">
            {isEditing ? 'Edit Estimate' : 'Create Cost Estimate'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer"
            title="Export JSON"
          >
            <FileJson size={16} />
            <span className="hidden sm:inline">JSON</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer"
            title="Export CSV"
          >
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={handleSave}
            id="save-estimate"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Save size={18} />
            {isEditing ? 'Update' : 'Save'} Estimate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ──────── LEFT COLUMN: form ──────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Project details */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-medium text-text-secondary mb-4">Project Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="project-name" className="block text-sm text-text-secondary mb-1.5">
                  Project Name <span className="text-danger">*</span>
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Portfolio Website"
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-surface-input border text-text-primary placeholder-text-dim text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-danger focus:ring-danger/30'
                      : 'border-border-default focus:ring-accent-blue/30 focus:border-accent-blue/50'
                  }`}
                />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="project-desc" className="block text-sm text-text-secondary mb-1.5">
                  Description
                </label>
                <input
                  id="project-desc"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of your project"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-input border border-border-default text-text-primary placeholder-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue/50 transition-all"
                />
              </div>

              <div>
                <label htmlFor="project-region" className="block text-sm text-text-secondary mb-1.5">
                  AWS Region
                </label>
                <select
                  id="project-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value as AWSRegion)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-input border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue/50 transition-all cursor-pointer"
                >
                  {(Object.keys(REGION_LABELS) as AWSRegion[]).map((r) => (
                    <option key={r} value={r}>
                      {REGION_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="project-notes" className="block text-sm text-text-secondary mb-1.5">
                  Notes / Assumptions
                </label>
                <input
                  id="project-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about this estimate"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface-input border border-border-default text-text-primary placeholder-text-dim text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Add services */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-medium text-text-secondary mb-4">
              AWS Services
              {errors.services && (
                <span className="text-danger ml-2 text-xs font-normal">{errors.services}</span>
              )}
            </h3>

            {/* Service picker buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {(Object.keys(SERVICE_META) as ServiceType[]).map((type) => {
                const meta = SERVICE_META[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleAddService(type)}
                    className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-border-default hover:border-accent-blue/40 hover:bg-surface-hover transition-all cursor-pointer group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                    >
                      {SERVICE_ICONS[type]}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-text-primary">{meta.name}</p>
                      <p className="text-[11px] text-text-muted mt-0.5 leading-tight">{meta.description.split('.')[0]}</p>
                    </div>
                    <PlusCircle size={14} className="text-text-muted group-hover:text-accent-blue transition-colors" />
                  </button>
                );
              })}
            </div>

            {/* Configured services (accordion) */}
            <div className="space-y-3">
              {services.map((svc, idx) => {
                const meta = SERVICE_META[svc.config.serviceType];
                const isOpen = expandedService === svc.id;
                const svcEstimate = estimate.services[idx];

                return (
                  <div
                    key={svc.id}
                    className={`rounded-xl border transition-all ${
                      isOpen
                        ? 'border-accent-blue/30 bg-surface-hover/50'
                        : 'border-border-default bg-surface-card'
                    }`}
                  >
                    {/* Accordion header */}
                    <button
                      onClick={() =>
                        setExpandedService(isOpen ? null : svc.id)
                      }
                      className="w-full flex items-center justify-between p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                        >
                          {SERVICE_ICONS[svc.config.serviceType]}
                        </div>
                        <span className="text-sm font-medium text-text-primary">
                          {meta.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-accent-blue-light">
                          {svcEstimate ? formatCurrency(svcEstimate.monthlyCost) : '—'}
                          <span className="text-xs text-text-muted font-normal">/mo</span>
                        </span>
                        {isOpen ? (
                          <ChevronUp size={16} className="text-text-muted" />
                        ) : (
                          <ChevronDown size={16} className="text-text-muted" />
                        )}
                      </div>
                    </button>

                    {/* Accordion body — config form */}
                    {isOpen && (
                      <div className="px-4 pb-4 space-y-4 animate-fade-in">
                        <ServiceConfigForm
                          config={svc.config}
                          onChange={(c) => handleUpdateService(svc.id, c)}
                        />

                        {/* Breakdown */}
                        {svcEstimate && (
                          <div className="p-3 rounded-lg bg-navy-950/50 text-xs space-y-1">
                            <p className="text-text-muted font-medium mb-1">Calculation:</p>
                            {svcEstimate.breakdown.map((line, i) => (
                              <p key={i} className="text-text-secondary font-mono">{line}</p>
                            ))}
                            {svcEstimate.warnings.length > 0 && (
                              <div className="flex items-start gap-1.5 mt-2 text-warning">
                                <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                                <div>
                                  {svcEstimate.warnings.map((w, i) => (
                                    <p key={i}>{w}</p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          onClick={() => handleRemoveService(svc.id)}
                          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger transition-colors cursor-pointer"
                        >
                          <X size={14} />
                          Remove {meta.name}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {services.length === 0 && (
                <div className="text-center py-8 text-text-muted text-sm">
                  <Layers size={24} className="mx-auto mb-2 opacity-40" />
                  Click a service above to add it to your estimate.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ──────── RIGHT COLUMN: live summary ──────── */}
        <div className="space-y-5">
          {/* Total cost card */}
          <div className="glass-card p-5 glow-blue">
            <h3 className="text-sm font-medium text-text-secondary mb-3">Estimated Cost</h3>
            <p className="text-3xl font-bold text-text-primary">
              {formatCurrency(estimate.totalMonthlyCost)}
              <span className="text-sm text-text-muted font-normal ml-1">/month</span>
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {formatCurrency(estimate.totalAnnualCost)}
              <span className="text-text-muted">/year</span>
              <span className="text-xs text-text-dim ml-1">(12 × monthly)</span>
            </p>

            {/* Mini pie chart */}
            {pieData.length > 0 && (
              <div className="h-48 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={42}
                      paddingAngle={3}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1a2236',
                        border: '1px solid rgba(148,163,184,0.12)',
                        borderRadius: 8,
                        color: '#f1f5f9',
                        fontSize: 12,
                      }}
                      formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Monthly']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Service cost breakdown */}
            <div className="space-y-2 mt-2">
              {estimate.services.map((s, i) => {
                const meta = SERVICE_META[s.serviceType];
                const pct =
                  estimate.totalMonthlyCost > 0
                    ? ((s.monthlyCost / estimate.totalMonthlyCost) * 100).toFixed(1)
                    : '0.0';
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: meta?.color }}
                      />
                      <span className="text-text-secondary">{meta?.name}</span>
                    </div>
                    <span className="text-text-primary font-medium">
                      {formatCurrency(s.monthlyCost)}
                      <span className="text-text-dim text-xs ml-1">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assumptions */}
          {estimate.services.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                <Info size={14} />
                Key Assumptions
              </h3>
              <ul className="space-y-1.5 text-xs text-text-muted">
                {Array.from(
                  new Set(estimate.services.flatMap((s) => s.assumptions)),
                ).map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent-blue mt-0.5">•</span>
                    {a}
                  </li>
                ))}
                <li className="flex items-start gap-2 mt-2 pt-2 border-t border-border-subtle">
                  <span className="text-warning mt-0.5">•</span>
                  <span>
                    Actual costs depend on region, usage, data transfer, taxes, discounts, and free-tier
                    eligibility.{' '}
                    <a
                      href="https://calculator.aws/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-blue hover:underline inline-flex items-center gap-1"
                    >
                      Verify on AWS <ExternalLink size={10} />
                    </a>
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
                <Lightbulb size={14} className="text-accent-violet-light" />
                Optimisation Tips
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Service Configuration Forms                                       */
/* ================================================================== */

function ServiceConfigForm({
  config,
  onChange,
}: {
  config: ServiceConfig;
  onChange: (c: ServiceConfig) => void;
}) {
  switch (config.serviceType) {
    case 'ec2':
      return <EC2Form config={config} onChange={onChange} />;
    case 's3':
      return <S3Form config={config} onChange={onChange} />;
    case 'lambda':
      return <LambdaForm config={config} onChange={onChange} />;
    case 'dynamodb':
      return <DynamoDBForm config={config} onChange={onChange} />;
    default:
      return null;
  }
}

/* ─── Shared input component ─── */

function FormField({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1">
        {label}
      </label>
      {children}
      {help && <p className="text-[11px] text-text-dim mt-1">{help}</p>}
    </div>
  );
}

function NumericInput({
  value,
  onChange,
  min = 0,
  max,
  step,
  id,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
}) {
  return (
    <input
      id={id}
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v)) onChange(v);
      }}
      className="w-full px-3 py-2 rounded-lg bg-surface-input border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue/50 transition-all"
    />
  );
}

/* ─── EC2 ─── */
function EC2Form({ config, onChange }: { config: EC2Config; onChange: (c: ServiceConfig) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="Number of Instances" help="How many EC2 instances will you run?">
        <NumericInput
          value={config.instanceCount}
          onChange={(v) => onChange({ ...config, instanceCount: Math.max(1, Math.round(v)) })}
          min={1}
          max={100}
        />
      </FormField>

      <FormField label="Hours per Month" help="730 = 24/7 for a full month">
        <NumericInput
          value={config.hoursPerMonth}
          onChange={(v) => onChange({ ...config, hoursPerMonth: Math.max(1, Math.round(v)) })}
          min={1}
          max={744}
        />
      </FormField>

      <FormField label="Instance Type" help="Larger = more CPU & RAM = more cost">
        <select
          value={config.instanceTier}
          onChange={(e) => onChange({ ...config, instanceTier: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-surface-input border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue/50 transition-all cursor-pointer"
        >
          {EC2_TIERS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Operating System" help="Windows includes a licence surcharge">
        <select
          value={config.operatingSystem}
          onChange={(e) => onChange({ ...config, operatingSystem: e.target.value as 'linux' | 'windows' })}
          className="w-full px-3 py-2 rounded-lg bg-surface-input border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue/50 transition-all cursor-pointer"
        >
          <option value="linux">Linux / Unix</option>
          <option value="windows">Windows</option>
        </select>
      </FormField>
    </div>
  );
}

/* ─── S3 ─── */
function S3Form({ config, onChange }: { config: S3Config; onChange: (c: ServiceConfig) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="Storage (GB)" help="Total GB of data stored in S3">
        <NumericInput
          value={config.storageGB}
          onChange={(v) => onChange({ ...config, storageGB: Math.max(0, v) })}
          min={0}
        />
      </FormField>

      <FormField label="Requests / Month" help="PUT, GET, LIST — combined estimate">
        <NumericInput
          value={config.requestsPerMonth}
          onChange={(v) => onChange({ ...config, requestsPerMonth: Math.max(0, Math.round(v)) })}
          min={0}
          step={1000}
        />
      </FormField>
    </div>
  );
}

/* ─── Lambda ─── */
function LambdaForm({ config, onChange }: { config: LambdaConfig; onChange: (c: ServiceConfig) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="Invocations / Month" help="Number of times your function runs">
        <NumericInput
          value={config.invocationsPerMonth}
          onChange={(v) => onChange({ ...config, invocationsPerMonth: Math.max(0, Math.round(v)) })}
          min={0}
          step={100000}
        />
      </FormField>

      <FormField label="Avg Duration (ms)" help="How long each invocation takes on average">
        <NumericInput
          value={config.avgDurationMs}
          onChange={(v) => onChange({ ...config, avgDurationMs: Math.max(1, Math.round(v)) })}
          min={1}
          max={900000}
        />
      </FormField>

      <FormField label="Memory (MB)" help="Higher memory = proportionally more CPU">
        <select
          value={config.memoryMB}
          onChange={(e) => onChange({ ...config, memoryMB: parseInt(e.target.value) })}
          className="w-full px-3 py-2 rounded-lg bg-surface-input border border-border-default text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue/50 transition-all cursor-pointer"
        >
          {[128, 256, 512, 1024, 2048, 3008].map((m) => (
            <option key={m} value={m}>{m} MB</option>
          ))}
        </select>
      </FormField>
    </div>
  );
}

/* ─── DynamoDB ─── */
function DynamoDBForm({ config, onChange }: { config: DynamoDBConfig; onChange: (c: ServiceConfig) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="Read Requests / Month" help="Number of read request units (RRUs)">
        <NumericInput
          value={config.readRequestsPerMonth}
          onChange={(v) => onChange({ ...config, readRequestsPerMonth: Math.max(0, Math.round(v)) })}
          min={0}
          step={10000}
        />
      </FormField>

      <FormField label="Write Requests / Month" help="Number of write request units (WRUs)">
        <NumericInput
          value={config.writeRequestsPerMonth}
          onChange={(v) => onChange({ ...config, writeRequestsPerMonth: Math.max(0, Math.round(v)) })}
          min={0}
          step={10000}
        />
      </FormField>

      <FormField label="Storage (GB)" help="First 25 GB free (not deducted here)">
        <NumericInput
          value={config.storageGB}
          onChange={(v) => onChange({ ...config, storageGB: Math.max(0, v) })}
          min={0}
        />
      </FormField>
    </div>
  );
}

/* ================================================================== */
/*  Recommendation Card                                               */
/* ================================================================== */

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false);

  const priorityColors = {
    high: 'border-danger/30 bg-danger-glow/30',
    medium: 'border-warning/30 bg-warning-glow/30',
    low: 'border-accent-blue/20 bg-accent-blue-glow/30',
  };

  const priorityBadge = {
    high: 'bg-danger/20 text-danger',
    medium: 'bg-warning/20 text-warning',
    low: 'bg-accent-blue/20 text-accent-blue-light',
  };

  return (
    <div className={`rounded-lg border p-3 ${priorityColors[rec.priority]}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${priorityBadge[rec.priority]}`}>
                {rec.priority}
              </span>
              <h4 className="text-xs font-semibold text-text-primary">{rec.title}</h4>
            </div>
            {!expanded && (
              <p className="text-[11px] text-text-muted line-clamp-2">{rec.description}</p>
            )}
          </div>
          {expanded ? <ChevronUp size={14} className="text-text-muted mt-1 shrink-0" /> : <ChevronDown size={14} className="text-text-muted mt-1 shrink-0" />}
        </div>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2 animate-fade-in">
          <p className="text-xs text-text-secondary">{rec.description}</p>
          <div>
            <p className="text-[11px] text-text-muted font-medium mb-1">What to investigate:</p>
            <ul className="space-y-1">
              {rec.actionItems.map((item, i) => (
                <li key={i} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                  <span className="text-accent-violet-light mt-0.5">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {rec.potentialSavings && (
            <div className="text-[11px] p-2 rounded bg-success-glow/30 text-success">
              💡 Potential saving: ~{formatCurrency(rec.potentialSavings.amount)}/mo — {rec.potentialSavings.assumption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Need to import Layers for the empty state
import { Layers } from 'lucide-react';
