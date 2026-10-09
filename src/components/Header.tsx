/**
 * Header — Top navigation bar with AWS Region selector and prominent New Estimate CTA
 */

import { Cloud, Globe, ChevronDown, PlusCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { AppView, AWSRegion } from '../types';
import { REGION_LABELS } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  selectedRegion: AWSRegion;
  onRegionChange: (region: AWSRegion) => void;
}

export default function Header({
  currentView,
  onNavigate,
  selectedRegion,
  onRegionChange,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { view: AppView; label: string }[] = [
    { view: 'dashboard', label: 'Dashboard' },
    { view: 'create', label: 'Create Estimate' },
    { view: 'templates', label: 'Templates' },
    { view: 'saved', label: 'Saved Estimates' },
    { view: 'agent', label: 'Cost Watch Agent' },
    { view: 'learn', label: 'Learn' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#080d1a]/90 border-b border-slate-800/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Tagline */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 text-left hover:opacity-95 transition-opacity cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-blue-500/10">
              <div className="w-full h-full bg-[#0d1322] rounded-[11px] flex items-center justify-center">
                <Cloud size={20} className="text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none flex items-center gap-1.5">
                CloudCost Buddy
              </h1>
              <p className="text-[11px] text-slate-400 mt-1 leading-none font-normal">
                Plan smarter. Estimate before you deploy.
              </p>
            </div>
          </button>

          {/* Right actions: Region Selector & New Estimate CTA */}
          <div className="flex items-center gap-3">
            {/* AWS Region Selector Dropdown */}
            <div className="relative flex items-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors text-xs text-slate-300">
                <Globe size={14} className="text-blue-400 shrink-0" />
                <span className="hidden sm:inline font-medium text-slate-300">
                  {REGION_LABELS[selectedRegion]}
                </span>
                <span className="sm:hidden font-medium text-slate-300">
                  {selectedRegion}
                </span>
                <ChevronDown size={13} className="text-slate-500" />
                <select
                  value={selectedRegion}
                  onChange={(e) => onRegionChange(e.target.value as AWSRegion)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Change AWS Region"
                >
                  {(Object.keys(REGION_LABELS) as AWSRegion[]).map((r) => (
                    <option key={r} value={r} className="bg-slate-900 text-slate-200">
                      {REGION_LABELS[r]} ({r})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prominent New Estimate Button */}
            <button
              id="header-new-estimate-btn"
              onClick={() => onNavigate('create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
            >
              <PlusCircle size={16} />
              <span>New Estimate</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-slate-800 bg-[#0a0f1d] space-y-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                onNavigate(item.view);
                setMobileMenuOpen(false);
              }}
              className={`
                w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  currentView === item.view
                    ? 'bg-blue-600/15 text-blue-400 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
