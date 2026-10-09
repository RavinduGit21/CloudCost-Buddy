/**
 * Sidebar — Left navigation sidebar matching the AWS-inspired dark dashboard mockup
 */

import {
  LayoutDashboard,
  PlusCircle,
  LayoutGrid,
  Bookmark,
  BookOpen,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import type { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  savedCount: number;
}

export default function Sidebar({ currentView, onNavigate, savedCount }: SidebarProps) {
  const navItems = [
    { view: 'dashboard' as AppView, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { view: 'create' as AppView, label: 'Create Estimate', icon: <PlusCircle size={18} /> },
    { view: 'templates' as AppView, label: 'Templates', icon: <LayoutGrid size={18} /> },
    {
      view: 'saved' as AppView,
      label: 'Saved Estimates',
      icon: <Bookmark size={18} />,
      badge: savedCount > 0 ? savedCount : undefined,
    },
    { view: 'learn' as AppView, label: 'Learn', icon: <BookOpen size={18} /> },
  ];

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col justify-between py-5 pr-4 border-r border-slate-800/60 select-none">
      <div className="space-y-1.5">
        {navItems.map((item) => {
          const isActive = currentView === item.view || (item.view === 'create' && currentView === 'edit');
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`
                w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-left
                ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Free Tier Callout at bottom of Sidebar */}
      <div
        onClick={() => onNavigate('learn')}
        className="mt-8 p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-amber-500/30 transition-all cursor-pointer group"
      >
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                AWS Free Tier
              </span>
              <ChevronRight size={13} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Explore services you can try for free.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
