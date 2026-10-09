/**
 * Dashboard Page
 *
 * Shows:
 *   - Welcome message
 *   - Summary cards (monthly cost, annual cost, # services, most expensive)
 *   - Charts (cost breakdown bar chart, service distribution pie chart)
 *   - List of saved estimates
 *   - Empty state if no projects exist
 */

import { useMemo } from 'react';
import {
  DollarSign,
  Calendar,
  Layers,
  TrendingUp,
  PlusCircle,
  Trash2,
  Copy,
  Edit3,
  FileJson,
  FileSpreadsheet,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import type { AppView, Project } from '../types';
import { calculateProjectCost } from '../features/pricing/calculateCost';
import { exportProjectJSON, exportProjectCSV } from '../features/storage/estimateStorage';
import { SERVICE_META } from '../data/pricingData';
import { formatCurrency, formatDate } from '../lib/utils';

interface DashboardProps {
  projects: Project[];
  onNavigate: (view: AppView, projectId?: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClearAll: () => void;
}

const CHART_COLORS = ['#f59e0b', '#22c55e', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6'];

export default function Dashboard({
  projects,
  onNavigate,
  onDelete,
  onDuplicate,
  onClearAll,
}: DashboardProps) {
  // Aggregate stats across all projects
  const stats = useMemo(() => {
    if (projects.length === 0) {
      return { totalMonthly: 0, totalAnnual: 0, serviceCount: 0, topService: null as string | null };
    }

    let totalMonthly = 0;
    const serviceTotals: Record<string, number> = {};

    for (const p of projects) {
      const est = calculateProjectCost(p.services, p.region);
      totalMonthly += est.totalMonthlyCost;
      for (const s of est.services) {
        const name = SERVICE_META[s.serviceType]?.name ?? s.serviceType;
        serviceTotals[name] = (serviceTotals[name] ?? 0) + s.monthlyCost;
      }
    }

    const serviceCount = Object.keys(serviceTotals).length;
    const topService =
      serviceCount > 0
        ? Object.entries(serviceTotals).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    return {
      totalMonthly,
      totalAnnual: totalMonthly * 12,
      serviceCount,
      topService,
    };
  }, [projects]);

  // Chart data: per-project breakdown
  const barChartData = useMemo(() => {
    return projects.map((p) => {
      const est = calculateProjectCost(p.services, p.region);
      return { name: p.name.slice(0, 20), cost: parseFloat(est.totalMonthlyCost.toFixed(2)) };
    });
  }, [projects]);

  // Chart data: service distribution across all projects
  const pieChartData = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const p of projects) {
      const est = calculateProjectCost(p.services, p.region);
      for (const s of est.services) {
        const name = SERVICE_META[s.serviceType]?.name ?? s.serviceType;
        totals[name] = (totals[name] ?? 0) + s.monthlyCost;
      }
    }
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [projects]);

  /* ── Empty state ── */
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-violet/20 flex items-center justify-center mb-6 animate-pulse-glow">
          <Sparkles size={36} className="text-accent-blue-light" />
        </div>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          Welcome to CloudCost Buddy
        </h2>
        <p className="text-text-secondary mb-1 max-w-md text-center">
          Plan smarter. Estimate your AWS infrastructure costs before you deploy.
        </p>
        <p className="text-text-muted text-sm mb-8 max-w-md text-center">
          Create your first cost estimate to see monthly totals, breakdowns, and optimisation tips.
        </p>
        <button
          id="create-first-estimate"
          onClick={() => onNavigate('create')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all cursor-pointer"
        >
          <PlusCircle size={20} />
          Create Your First Estimate
        </button>
      </div>
    );
  }

  /* ── Dashboard with data ── */
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">Dashboard</h2>
          <p className="text-text-secondary text-sm mt-0.5">
            Overview of your {projects.length} saved estimate{projects.length !== 1 ? 's' : ''}.
            Annual costs are a simple 12× monthly projection.
          </p>
        </div>
        <button
          id="create-new-estimate"
          onClick={() => onNavigate('create')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer self-start"
        >
          <PlusCircle size={18} />
          Create Cost Estimate
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<DollarSign size={22} />}
          label="Monthly Estimate"
          value={formatCurrency(stats.totalMonthly)}
          accent="blue"
        />
        <SummaryCard
          icon={<Calendar size={22} />}
          label="Annual Projection"
          value={formatCurrency(stats.totalAnnual)}
          accent="violet"
          note="12 × monthly (same-usage assumption)"
        />
        <SummaryCard
          icon={<Layers size={22} />}
          label="Service Types"
          value={String(stats.serviceCount)}
          accent="green"
        />
        <SummaryCard
          icon={<TrendingUp size={22} />}
          label="Top Service"
          value={stats.topService ?? '—'}
          accent="amber"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart — monthly cost per project */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-text-secondary mb-4">
            Monthly Cost by Estimate
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    background: '#1a2236',
                    border: '1px solid rgba(148,163,184,0.12)',
                    borderRadius: 8,
                    color: '#f1f5f9',
                  }}
                  formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Monthly Cost']}
                />
                <Bar dataKey="cost" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {barChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart — service distribution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-text-secondary mb-4">
            Service Distribution (All Estimates)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }: any) =>
                    `${(name || '').replace('Amazon ', '').replace('AWS ', '')} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1a2236',
                    border: '1px solid rgba(148,163,184,0.12)',
                    borderRadius: 8,
                    color: '#f1f5f9',
                  }}
                  formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Monthly Cost']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Saved estimates list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-primary">
            Saved Estimates
          </h3>
          <button
            onClick={() => {
              if (window.confirm('Delete ALL saved estimates? This cannot be undone.')) {
                onClearAll();
              }
            }}
            className="text-xs text-text-muted hover:text-danger transition-colors cursor-pointer"
          >
            Clear all
          </button>
        </div>
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => onNavigate('edit', project.id)}
              onDelete={() => {
                if (window.confirm(`Delete "${project.name}"? This cannot be undone.`)) {
                  onDelete(project.id);
                }
              }}
              onDuplicate={() => onDuplicate(project.id)}
            />
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning-glow border border-warning/20 text-sm">
        <AlertTriangle size={18} className="text-warning mt-0.5 shrink-0" />
        <p className="text-text-secondary">
          <strong className="text-warning">Disclaimer:</strong> These are educational estimates based
          on sample AWS pricing. Actual costs depend on region, usage patterns, data transfer, taxes,
          discounts, and free-tier eligibility. Always verify with the{' '}
          <a
            href="https://calculator.aws/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue hover:underline"
          >
            official AWS Pricing Calculator
          </a>
          .
        </p>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function SummaryCard({
  icon,
  label,
  value,
  accent,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'blue' | 'violet' | 'green' | 'amber';
  note?: string;
}) {
  const accentColors = {
    blue: 'from-accent-blue/15 to-accent-blue/5 text-accent-blue-light',
    violet: 'from-accent-violet/15 to-accent-violet/5 text-accent-violet-light',
    green: 'from-success/15 to-success/5 text-success',
    amber: 'from-warning/15 to-warning/5 text-warning',
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accentColors[accent]} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      {note && <p className="text-xs text-text-muted mt-1">{note}</p>}
    </div>
  );
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const estimate = useMemo(
    () => calculateProjectCost(project.services, project.region),
    [project],
  );

  const handleExportJSON = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportProjectJSON(project);
  };

  const handleExportCSV = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportProjectCSV(
      project,
      estimate.services.map((s) => ({
        service: SERVICE_META[s.serviceType]?.name ?? s.serviceType,
        monthlyCost: s.monthlyCost,
      })),
    );
  };

  return (
    <div
      className="glass-card p-4 sm:p-5 cursor-pointer hover:border-accent-blue/30 transition-all"
      onClick={onEdit}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-text-primary truncate">
            {project.name}
          </h4>
          {project.description && (
            <p className="text-sm text-text-muted mt-0.5 truncate">{project.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
            <span>{project.services.length} service{project.services.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>{project.region}</span>
            <span>•</span>
            <span>{formatDate(project.updatedAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-bold text-accent-blue-light mr-2">
            {formatCurrency(estimate.totalMonthlyCost)}
            <span className="text-xs text-text-muted font-normal">/mo</span>
          </span>
          <ActionButton icon={<Edit3 size={15} />} title="Edit" onClick={(e) => { e.stopPropagation(); onEdit(); }} />
          <ActionButton icon={<Copy size={15} />} title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicate(); }} />
          <ActionButton icon={<FileJson size={15} />} title="Export JSON" onClick={handleExportJSON} />
          <ActionButton icon={<FileSpreadsheet size={15} />} title="Export CSV" onClick={handleExportCSV} />
          <ActionButton icon={<Trash2 size={15} />} title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(); }} danger />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  title,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`
        w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer
        ${
          danger
            ? 'text-text-muted hover:text-danger hover:bg-danger-glow'
            : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
        }
      `}
    >
      {icon}
    </button>
  );
}
