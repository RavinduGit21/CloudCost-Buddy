/**
 * Dashboard Page — Visual reference implementation matching the AWS dark theme dashboard mockup
 */

import { useState, useMemo } from 'react';
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
  ChevronRight,
  Lightbulb,
  Sparkles,
  BookOpen,
  Server,
  Database,
  Zap,
  Table2,
  Globe,
  ShoppingCart,
  ArrowDownRight,
  Gift,
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
  LabelList,
} from 'recharts';

import type { AppView, Project, AWSRegion } from '../types';
import { REGION_LABELS } from '../types';
import { calculateProjectCost } from '../features/pricing/calculateCost';
import { exportProjectJSON, exportProjectCSV } from '../features/storage/estimateStorage';
import { SERVICE_META } from '../data/pricingData';
import { POPULAR_TEMPLATES, type ArchitectureTemplate } from '../data/templates';
import { formatCurrency, formatDate } from '../lib/utils';

interface DashboardProps {
  projects: Project[];
  selectedRegion: AWSRegion;
  onNavigate: (view: AppView, projectId?: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onClearAll: () => void;
  onUseTemplate: (template: ArchitectureTemplate) => void;
}

const SERVICE_PALETTE: Record<string, { color: string; label: string }> = {
  ec2: { color: '#f59e0b', label: 'Amazon EC2' },
  s3: { color: '#22c55e', label: 'Amazon S3' },
  lambda: { color: '#8b5cf6', label: 'AWS Lambda' },
  dynamodb: { color: '#3b82f6', label: 'Amazon DynamoDB' },
};

export default function Dashboard({
  projects,
  selectedRegion,
  onNavigate,
  onDelete,
  onDuplicate,
  onClearAll,
  onUseTemplate,
}: DashboardProps) {
  const [timeView, setTimeView] = useState<'monthly' | 'annual'>('monthly');

  // Primary project for summary metrics (or aggregate if multiple)
  const primaryProject = projects[0] ?? null;

  // Real-time calculation of primary project or aggregate
  const primaryEstimate = useMemo(() => {
    if (!primaryProject) return null;
    return calculateProjectCost(primaryProject.services, primaryProject.region);
  }, [primaryProject]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (!primaryEstimate || !primaryProject) {
      return {
        monthlyCost: 0,
        annualCost: 0,
        servicesCount: 0,
        topService: 'None',
        topServicePct: 0,
      };
    }

    const totalMonthly = primaryEstimate.totalMonthlyCost;
    const sortedServices = [...primaryEstimate.services].sort(
      (a, b) => b.monthlyCost - a.monthlyCost,
    );
    const top = sortedServices[0];
    const topName = top ? (SERVICE_META[top.serviceType]?.name ?? top.serviceType) : 'None';
    const topPct = totalMonthly > 0 && top ? Math.round((top.monthlyCost / totalMonthly) * 100) : 0;

    return {
      monthlyCost: totalMonthly,
      annualCost: primaryEstimate.totalAnnualCost,
      servicesCount: primaryProject.services.length,
      topService: topName,
      topServicePct: topPct,
    };
  }, [primaryEstimate, primaryProject]);

  // Data for "Monthly Cost by Service" Bar Chart
  const barChartData = useMemo(() => {
    if (!primaryEstimate) return [];
    return primaryEstimate.services.map((s) => {
      const shortName = s.serviceType === 'dynamodb' ? 'DynamoDB' : s.serviceType.toUpperCase();
      const mult = timeView === 'annual' ? 12 : 1;
      const cost = parseFloat((s.monthlyCost * mult).toFixed(2));
      return {
        key: s.serviceType,
        name: shortName,
        cost,
        displayCost: `$${cost.toFixed(2)}`,
        fill: SERVICE_PALETTE[s.serviceType]?.color ?? '#3b82f6',
      };
    });
  }, [primaryEstimate, timeView]);

  // Data for "Service Distribution" Donut Chart
  const pieChartData = useMemo(() => {
    if (!primaryEstimate || primaryEstimate.totalMonthlyCost === 0) return [];
    return primaryEstimate.services.map((s) => {
      const meta = SERVICE_PALETTE[s.serviceType];
      const name = meta?.label ?? s.serviceType;
      const pct = Math.round((s.monthlyCost / primaryEstimate.totalMonthlyCost) * 100);
      return {
        name,
        value: parseFloat(s.monthlyCost.toFixed(2)),
        pct,
        color: meta?.color ?? '#3b82f6',
      };
    });
  }, [primaryEstimate]);

  /* ── Empty State View ── */
  if (projects.length === 0) {
    return (
      <div className="space-y-10 py-6 animate-fade-in max-w-5xl mx-auto">
        <div className="text-center py-12 px-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center mb-4">
            <Sparkles size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Welcome to CloudCost Buddy</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
            Plan smarter. Estimate your AWS infrastructure costs with live calculation and rule-based
            optimizations before provisioning resources.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('create')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <PlusCircle size={18} />
              Create Your First Estimate
            </button>
          </div>
        </div>

        {/* Quick Launch Templates */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Or Start with a Popular Template</h3>
              <p className="text-xs text-slate-400 mt-0.5">Pre-configured architectures ready to customize</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {POPULAR_TEMPLATES.map((tpl) => (
              <TemplateCard key={tpl.id} template={tpl} onUse={() => onUseTemplate(tpl)} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Top Dashboard Header ── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          Dashboard <span className="inline-block animate-wave">👋</span>
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Welcome back! Here's an overview of your saved estimates in {REGION_LABELS[selectedRegion]}.
        </p>
      </div>

      {/* ── Grid: Center Content (2 cols) & Right Column (1 col) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ── Center & Left Column (8 of 12 cols on desktop) ── */}
        <div className="xl:col-span-8 space-y-6">
          {/* 4 Quick Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Monthly Estimate */}
            <div className="rounded-2xl p-4 bg-[#101726] border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <DollarSign size={16} />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Monthly Estimate</span>
                </div>
                <div className="text-2xl font-bold text-slate-100 tracking-tight">
                  {formatCurrency(stats.monthlyCost)}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
                <ArrowDownRight size={14} />
                <span>28% vs previous estimate</span>
              </div>
            </div>

            {/* 2. Annual Projection */}
            <div className="rounded-2xl p-4 bg-[#101726] border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Annual Projection</span>
                </div>
                <div className="text-2xl font-bold text-slate-100 tracking-tight">
                  {formatCurrency(stats.annualCost)}
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">12 × monthly (same usage)</p>
            </div>

            {/* 3. Services Used */}
            <div className="rounded-2xl p-4 bg-[#101726] border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Layers size={16} />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Services Used</span>
                </div>
                <div className="text-2xl font-bold text-slate-100 tracking-tight">
                  {stats.servicesCount}
                </div>
              </div>
              {/* Mini service badges */}
              <div className="mt-3 flex items-center gap-1.5">
                <span title="Amazon EC2" className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center text-[10px]">
                  <Server size={11} />
                </span>
                <span title="Amazon S3" className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px]">
                  <Database size={11} />
                </span>
                <span title="AWS Lambda" className="w-5 h-5 rounded-md bg-purple-500/15 text-purple-400 flex items-center justify-center text-[10px]">
                  <Zap size={11} />
                </span>
                <span title="Amazon DynamoDB" className="w-5 h-5 rounded-md bg-blue-500/15 text-blue-400 flex items-center justify-center text-[10px]">
                  <Table2 size={11} />
                </span>
              </div>
            </div>

            {/* 4. Top Service */}
            <div
              onClick={() => primaryProject && onNavigate('edit', primaryProject.id)}
              className="rounded-2xl p-4 bg-[#101726] border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Top Service</span>
                </div>
                <div className="text-base font-bold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                  {stats.topService}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>{stats.topServicePct}% of total cost</span>
                <ChevronRight size={13} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* ── Charts Row (Bar Chart & Donut Chart) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Cost by Service Bar Chart */}
            <div className="rounded-2xl p-5 bg-[#101726] border border-slate-800/80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200">Monthly Cost by Service</h3>
                <div className="relative">
                  <select
                    value={timeView}
                    onChange={(e) => setTimeView(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1 pr-6 cursor-pointer focus:outline-none focus:border-blue-500 appearance-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                  <span className="absolute right-2 top-2 pointer-events-none text-[10px] text-slate-500">▼</span>
                </div>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.06)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{
                        background: '#0d1322',
                        border: '1px solid rgba(148,163,184,0.15)',
                        borderRadius: 10,
                        color: '#f8fafc',
                        fontSize: 12,
                      }}
                      formatter={(val: any) => [`$${Number(val || 0).toFixed(2)}`, 'Cost']}
                    />
                    <Bar dataKey="cost" radius={[6, 6, 0, 0]} maxBarSize={38}>
                      {barChartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.fill} />
                      ))}
                      <LabelList
                        dataKey="displayCost"
                        position="top"
                        fill="#cbd5e1"
                        fontSize={11}
                        fontWeight={600}
                        offset={8}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Service Distribution Donut Chart */}
            <div className="rounded-2xl p-5 bg-[#101726] border border-slate-800/80 flex flex-col justify-between">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Service Distribution</h3>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-full py-1">
                {/* Donut with Center Text */}
                <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {pieChartData.map((entry, idx) => (
                          <Cell key={`slice-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#0d1322',
                          border: '1px solid rgba(148,163,184,0.15)',
                          borderRadius: 10,
                          color: '#f8fafc',
                          fontSize: 12,
                        }}
                        formatter={(val: any) => [`$${Number(val || 0).toFixed(2)}`, 'Monthly']}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centered Total Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-bold text-slate-100">
                      {formatCurrency(stats.monthlyCost)}
                    </span>
                    <span className="text-[10px] text-slate-400">/ month</span>
                  </div>
                </div>

                {/* Right-hand Custom Legend */}
                <div className="flex-1 w-full space-y-2 text-xs">
                  {pieChartData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-300 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-slate-400">{item.pct}%</span>
                        <span className="font-semibold text-slate-200">${item.value.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Saved Estimates Section ── */}
          <div className="rounded-2xl p-5 bg-[#101726] border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-100">Saved Estimates</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-medium">
                  {projects.length} project{projects.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (window.confirm('Delete ALL saved estimates? This cannot be undone.')) {
                      onClearAll();
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
                <button
                  onClick={() => onNavigate('saved')}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  View all <ChevronRight size={13} />
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {projects.map((project, idx) => (
                <ProjectRowCard
                  key={project.id}
                  project={project}
                  iconIndex={idx}
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

          {/* ── Popular Templates Section ── */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-100">Popular Templates</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  Quick start
                </span>
              </div>
              <button
                onClick={() => onNavigate('templates')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Browse all <ChevronRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {POPULAR_TEMPLATES.map((tpl) => (
                <TemplateCard key={tpl.id} template={tpl} onUse={() => onUseTemplate(tpl)} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right-Side Panels Column (4 of 12 cols on desktop) ── */}
        <div className="xl:col-span-4 space-y-4">
          {/* Panel 1: Optimization Tips */}
          <div className="rounded-2xl p-5 bg-[#101726] border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Lightbulb size={14} />
                </div>
                <h3 className="text-sm font-bold text-slate-100">Optimization Tips</h3>
              </div>
              <button
                onClick={() => onNavigate('learn')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                View all <ChevronRight size={12} />
              </button>
            </div>

            {/* Tip 1: Reserved Instances */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700 transition-all space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
                    <Server size={12} />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">Consider Reserved Instances</h4>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 shrink-0">
                  High Impact
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pl-8">
                Your EC2 instance runs 24/7. You could save up to 30–72% with Reserved Instances or Savings Plans.
              </p>
            </div>

            {/* Tip 2: S3 Lifecycle Policies */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700 transition-all space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <Database size={12} />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">Use S3 Lifecycle Policies</h4>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
                  Medium
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pl-8">
                Move infrequently accessed files to S3 Standard-IA or Glacier to reduce storage costs.
              </p>
            </div>

            {/* Tip 3: Optimize Lambda Memory */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/70 hover:border-slate-700 transition-all space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                    <Zap size={12} />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">Optimize Lambda Memory</h4>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 shrink-0">
                  Low
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pl-8">
                Your Lambda functions might be using more memory than needed. Try 512MB or 256MB if possible.
              </p>
            </div>
          </div>

          {/* Panel 2: AWS Free Tier Info */}
          <div
            onClick={() => onNavigate('learn')}
            className="rounded-2xl p-5 bg-[#101726] border border-slate-800/80 hover:border-amber-500/30 transition-all cursor-pointer group space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Gift size={14} />
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                  AWS Free Tier Info
                </h3>
              </div>
              <span className="text-xs font-medium text-blue-400 group-hover:text-blue-300 transition-colors flex items-center gap-0.5">
                View details <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              You may be eligible for free tier benefits for EC2, S3, and Lambda during your first 12 months on AWS.
            </p>
          </div>

          {/* Panel 3: Learn AWS Cost Basics */}
          <div className="rounded-2xl p-5 bg-[#101726] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <BookOpen size={14} />
                </div>
                <h3 className="text-sm font-bold text-slate-100">Learn AWS Cost Basics</h3>
              </div>
              <button
                onClick={() => onNavigate('learn')}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                Explore topics <ChevronRight size={12} />
              </button>
            </div>

            <ul className="space-y-2 text-xs text-slate-400">
              <li
                onClick={() => onNavigate('learn')}
                className="flex items-center gap-2 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span>What is an AWS Region?</span>
              </li>
              <li
                onClick={() => onNavigate('learn')}
                className="flex items-center gap-2 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span>What is pay-as-you-go pricing?</span>
              </li>
              <li
                onClick={() => onNavigate('learn')}
                className="flex items-center gap-2 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span>Why EC2 running hours matter?</span>
              </li>
              <li
                onClick={() => onNavigate('learn')}
                className="flex items-center gap-2 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span>Storage vs. request charges</span>
              </li>
              <li
                onClick={() => onNavigate('learn')}
                className="flex items-center gap-2 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span>How to use the AWS Pricing Calculator</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-Components ─── */

function ProjectRowCard({
  project,
  iconIndex,
  onEdit,
  onDelete,
  onDuplicate,
}: {
  project: Project;
  iconIndex: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const estimate = useMemo(
    () => calculateProjectCost(project.services, project.region),
    [project],
  );

  const icons = [
    <ShoppingCart size={16} className="text-purple-400" />,
    <Globe size={16} className="text-emerald-400" />,
    <Zap size={16} className="text-indigo-400" />,
  ];
  const iconBg = [
    'bg-purple-500/15',
    'bg-emerald-500/15',
    'bg-indigo-500/15',
  ];

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
      onClick={onEdit}
      className="p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/70 hover:border-slate-700/80 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl ${
            iconBg[iconIndex % iconBg.length]
          } flex items-center justify-center shrink-0`}
        >
          {icons[iconIndex % icons.length]}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
            {project.name}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {project.services.length} service{project.services.length !== 1 ? 's' : ''} •{' '}
            {project.region} • {formatDate(project.updatedAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
        <span className="text-sm font-bold text-blue-400 tracking-tight">
          {formatCurrency(estimate.totalMonthlyCost)}
          <span className="text-xs text-slate-400 font-normal">/mo</span>
        </span>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            title="Duplicate"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Copy size={14} />
          </button>
          <button
            title="Export JSON"
            onClick={handleExportJSON}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <FileJson size={14} />
          </button>
          <button
            title="Export CSV"
            onClick={handleExportCSV}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet size={14} />
          </button>
          <button
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-0.5 transition-transform ml-1" />
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onUse,
}: {
  template: ArchitectureTemplate;
  onUse: () => void;
}) {
  const iconConfig = {
    server: {
      icon: <Server size={18} />,
      bg: 'bg-amber-500/15 text-amber-400',
    },
    zap: {
      icon: <Zap size={18} />,
      bg: 'bg-purple-500/15 text-purple-400',
    },
    globe: {
      icon: <Database size={18} />,
      bg: 'bg-emerald-500/15 text-emerald-400',
    },
    database: {
      icon: <Table2 size={18} />,
      bg: 'bg-blue-500/15 text-blue-400',
    },
  }[template.icon];

  return (
    <div className="p-4 rounded-2xl bg-[#101726] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3.5">
      <div className="space-y-2.5">
        <div className={`w-9 h-9 rounded-xl ${iconConfig.bg} flex items-center justify-center`}>
          {iconConfig.icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-200">{template.name}</h4>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">{template.description}</p>
        </div>
      </div>

      <button
        onClick={onUse}
        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer group"
      >
        <span>Use Template</span>
        <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
