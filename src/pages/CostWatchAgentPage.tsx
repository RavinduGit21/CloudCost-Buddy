/**
 * Cost Watch Agent Page
 *
 * Dedicated control panel and live audit interface for the Cost Watch Agent.
 */

import { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Info,
  Download,
  Copy,
  Check,
  DollarSign,
} from 'lucide-react';
import type { Project, AppView } from '../types';
import { runCostWatchAudit, type CostWatchReport } from '../features/agent/costWatchAgent';
import { formatDate } from '../lib/utils';

interface CostWatchAgentPageProps {
  projects: Project[];
  onNavigate: (view: AppView, projectId?: string) => void;
}

export default function CostWatchAgentPage({ projects, onNavigate }: CostWatchAgentPageProps) {
  const [budgetLimit, setBudgetLimit] = useState<number>(20.0);
  const [isAuditing, setIsAuditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Run audit whenever budget limit changes or projects change
  const report: CostWatchReport = useMemo(() => {
    return runCostWatchAudit(projects, budgetLimit);
  }, [projects, budgetLimit]);

  const handleManualAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
    }, 400);
  };

  const handleCopyReport = () => {
    const text = `CloudCost Buddy — Cost Watch Agent Report
Timestamp: ${formatDate(report.timestamp)}
Budget Ceiling: $${report.budgetLimitUSD.toFixed(2)}/month
Total Audited: ${report.totalProjectsAudited}
Breached: ${report.breachedCount} | Warning: ${report.warningCount} | Healthy: ${report.healthyCount}
Summary: ${report.agentSummary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportReportJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-watch-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                Cost Watch Agent
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                  Goal-Driven Agent
                </span>
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Autonomous budget monitoring, variance analysis, and prescriptive remediation roadmap
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={handleExportReportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Export Report JSON</span>
          </button>
        </div>
      </div>

      {/* ── Agent Goal / Policy Configuration Panel ── */}
      <div className="rounded-2xl p-5 bg-[#101726] border border-slate-800/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <DollarSign size={16} className="text-blue-400" />
              Agent Goal: Target Monthly Spending Ceiling
            </h3>
            <p className="text-xs text-slate-400">
              The Cost Watch Agent continuously audits saved architectures against this monthly budget limit.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-semibold">$</span>
              <input
                type="number"
                min="1"
                step="5"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(Math.max(1, Number(e.target.value) || 1))}
                className="w-32 bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-sm font-bold text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-500">/mo</span>
            </div>

            <button
              onClick={handleManualAudit}
              disabled={isAuditing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isAuditing ? 'animate-spin' : ''} />
              <span>{isAuditing ? 'Auditing...' : 'Run Agent Audit'}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-500">Quick Presets:</span>
          {[10, 20, 50, 100].map((preset) => (
            <button
              key={preset}
              onClick={() => setBudgetLimit(preset)}
              className={`
                px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer
                ${
                  budgetLimit === preset
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }
              `}
            >
              ${preset}/mo
            </button>
          ))}
        </div>
      </div>

      {/* ── Executive Audit Status Banner ── */}
      <div
        className={`
          p-4 rounded-2xl border flex items-start gap-3.5 transition-all
          ${
            report.breachedCount > 0
              ? 'bg-red-500/10 border-red-500/30 text-red-200'
              : report.warningCount > 0
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }
        `}
      >
        <div className="shrink-0 mt-0.5">
          {report.breachedCount > 0 ? (
            <ShieldAlert size={22} className="text-red-400" />
          ) : report.warningCount > 0 ? (
            <AlertTriangle size={22} className="text-amber-400" />
          ) : (
            <ShieldCheck size={22} className="text-emerald-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold">
            {report.breachedCount > 0
              ? `Budget Overrun Alert (${report.breachedCount} Breached)`
              : report.warningCount > 0
              ? `Budget Threshold Warning (${report.warningCount} Close to Limit)`
              : 'All Architecture Estimates Healthy'}
          </h4>
          <p className="text-xs mt-1 leading-relaxed opacity-90">{report.agentSummary}</p>
        </div>
      </div>

      {/* ── Summary Metrics Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl p-3.5 bg-[#101726] border border-slate-800/80">
          <span className="text-[11px] text-slate-400">Budget Limit</span>
          <p className="text-lg font-bold text-slate-100 mt-1">${report.budgetLimitUSD.toFixed(2)}/mo</p>
        </div>
        <div className="rounded-xl p-3.5 bg-[#101726] border border-slate-800/80">
          <span className="text-[11px] text-slate-400">Audited Projects</span>
          <p className="text-lg font-bold text-slate-100 mt-1">{report.totalProjectsAudited}</p>
        </div>
        <div className="rounded-xl p-3.5 bg-[#101726] border border-slate-800/80">
          <span className="text-[11px] text-slate-400">Breached</span>
          <p className="text-lg font-bold text-red-400 mt-1">{report.breachedCount}</p>
        </div>
        <div className="rounded-xl p-3.5 bg-[#101726] border border-slate-800/80">
          <span className="text-[11px] text-slate-400">Healthy</span>
          <p className="text-lg font-bold text-emerald-400 mt-1">{report.healthyCount}</p>
        </div>
      </div>

      {/* ── Detailed Project Findings & Remediation Roadmaps ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Project Audit Findings & Remediations</h3>
          <span className="text-xs text-slate-500">Evaluated at {formatDate(report.timestamp)}</span>
        </div>

        {report.projectResults.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-slate-900/40 border border-slate-800">
            <p className="text-sm text-slate-400">No saved estimates to inspect.</p>
          </div>
        ) : (
          report.projectResults.map((audit) => (
            <div
              key={audit.projectId}
              className={`
                rounded-2xl p-5 bg-[#101726] border transition-all space-y-4
                ${
                  audit.status === 'BREACHED'
                    ? 'border-red-500/30'
                    : audit.status === 'WARNING'
                    ? 'border-amber-500/30'
                    : 'border-slate-800/80'
                }
              `}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                      ${
                        audit.status === 'BREACHED'
                          ? 'bg-red-500/15 text-red-400'
                          : audit.status === 'WARNING'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }
                    `}
                  >
                    {audit.status === 'BREACHED' ? (
                      <ShieldAlert size={16} />
                    ) : audit.status === 'WARNING' ? (
                      <AlertTriangle size={16} />
                    ) : (
                      <ShieldCheck size={16} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{audit.projectName}</h4>
                    <span className="text-xs text-slate-400">{audit.region}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-bold text-slate-100">
                      ${audit.monthlyCostUSD.toFixed(2)}
                      <span className="text-xs text-slate-400 font-normal">/mo</span>
                    </span>
                    <div className="text-[11px] text-slate-400">
                      {audit.varianceUSD > 0 ? (
                        <span className="text-red-400 font-semibold">
                          +${audit.varianceUSD.toFixed(2)} over limit
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">
                          ${Math.abs(audit.varianceUSD).toFixed(2)} under budget
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`
                      text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0
                      ${
                        audit.status === 'BREACHED'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : audit.status === 'WARNING'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }
                    `}
                  >
                    {audit.status}
                  </span>
                </div>
              </div>

              {/* Culprit / Top Cost Driver */}
              {audit.topDriver && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Primary Cost Driver:{' '}
                    <strong className="text-slate-200">{audit.topDriver.serviceName}</strong>
                  </span>
                  <span className="font-semibold text-slate-300">
                    ${audit.topDriver.monthlyCostUSD.toFixed(2)}/mo ({audit.topDriver.shareOfTotalPct}% of total)
                  </span>
                </div>
              )}

              {/* Remediation Roadmap */}
              {audit.remediations.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <TrendingDown size={14} className="text-emerald-400" />
                    Agent Prescribed Remediation Plan:
                  </span>
                  <div className="space-y-2">
                    {audit.remediations.map((rem, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-200">{rem.title}</span>
                          {rem.estimatedSavingsUSD > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] shrink-0">
                              Saves ~${rem.estimatedSavingsUSD.toFixed(2)}/mo
                            </span>
                          )}
                        </div>

                        {rem.estimatedSavingsUSD > 0 && (
                          <p className="text-[11px] text-slate-400">
                            Projected cost with this fix:{' '}
                            <strong className="text-slate-200">${rem.projectedNewCostUSD.toFixed(2)}/mo</strong>{' '}
                            {rem.bringsUnderBudget ? (
                              <span className="text-emerald-400 font-semibold">(Brings architecture under budget!)</span>
                            ) : (
                              <span className="text-amber-400">(Reduces variance, but still over target)</span>
                            )}
                          </p>
                        )}

                        <ul className="list-disc pl-4 text-[11px] text-slate-400 space-y-0.5 pt-1">
                          {rem.actionItems.slice(0, 2).map((action, j) => (
                            <li key={j}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit link */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onNavigate('edit', audit.projectId)}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <span>Open & Adjust Architecture in Editor</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Honest Architecture Disclosure ── */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Info size={15} className="text-blue-400" />
          Agent Architecture & Academic Classification
        </div>
        <p className="leading-relaxed">
          The <strong>Cost Watch Agent</strong> is implemented as a <em>Goal-Based Heuristic Software Agent</em>.
          It perceives architecture state via deterministic pricing functions, evaluates against user-defined budget goals,
          identifies cost culprits, and automatically synthesizes a remediation roadmap. It operates locally with zero
          API token consumption, guaranteeing that educational estimates never hallucinate non-existent AWS rates.
        </p>
      </div>
    </div>
  );
}
