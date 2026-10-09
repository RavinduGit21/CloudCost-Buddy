/**
 * Header — Top navigation bar
 */

import { Cloud, LayoutDashboard, PlusCircle, BookOpen } from 'lucide-react';
import type { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export default function Header({ currentView, onNavigate }: HeaderProps) {
  const navItems: { view: AppView; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { view: 'create', label: 'New Estimate', icon: <PlusCircle size={18} /> },
    { view: 'learn', label: 'Learn', icon: <BookOpen size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-navy-950/80 border-b border-border-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center">
              <Cloud size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-text-primary leading-tight">
                CloudCost Buddy
              </h1>
              <p className="text-xs text-text-muted leading-tight -mt-0.5">
                Plan smarter. Estimate before you deploy.
              </p>
            </div>
          </button>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${
                    currentView === item.view
                      ? 'bg-accent-blue/15 text-accent-blue-light'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }
                `}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
