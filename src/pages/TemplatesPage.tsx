/**
 * Templates Page — Quick launch pre-configured AWS architectures
 */

import { POPULAR_TEMPLATES, type ArchitectureTemplate } from '../data/templates';
import { Server, Zap, Database, Table2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface TemplatesPageProps {
  onUseTemplate: (template: ArchitectureTemplate) => void;
  onCancel: () => void;
}

export default function TemplatesPage({ onUseTemplate, onCancel }: TemplatesPageProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <Server size={22} className="text-amber-400" />;
      case 'zap':
        return <Zap size={22} className="text-purple-400" />;
      case 'globe':
        return <Database size={22} className="text-emerald-400" />;
      default:
        return <Table2 size={22} className="text-blue-400" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'server':
        return 'bg-amber-500/15 border-amber-500/30';
      case 'zap':
        return 'bg-purple-500/15 border-purple-500/30';
      case 'globe':
        return 'bg-emerald-500/15 border-emerald-500/30';
      default:
        return 'bg-blue-500/15 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Architecture Templates <Sparkles size={22} className="text-amber-400" />
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Select a verified architectural pattern to immediately launch an interactive cost estimate.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {POPULAR_TEMPLATES.map((tpl) => (
          <div
            key={tpl.id}
            className="rounded-2xl p-5 bg-[#101726] border border-slate-800/80 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getIconBg(
                    tpl.icon,
                  )}`}
                >
                  {getIcon(tpl.icon)}
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {tpl.category}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                  {tpl.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tpl.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>{tpl.services.length} configured services</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Region: {tpl.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>Sample starting cost: ~{formatCurrency(tpl.estimatedMonthly)}/mo</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onUseTemplate(tpl)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Use This Template</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
