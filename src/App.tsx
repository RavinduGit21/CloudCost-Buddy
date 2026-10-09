/**
 * App.tsx — Root component & layout matching the AWS-inspired dark dashboard mockup
 */

import { useState, useCallback, useEffect } from 'react';
import type { AppView, Project, AWSRegion } from './types';
import {
  loadProjects,
  upsertProject,
  deleteProject,
  duplicateProject,
  clearAllProjects,
} from './features/storage/estimateStorage';
import Dashboard from './pages/Dashboard';
import CreateEstimate from './pages/CreateEstimate';
import TemplatesPage from './pages/TemplatesPage';
import CostWatchAgentPage from './pages/CostWatchAgentPage';
import LearnPage from './pages/LearnPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import type { ArchitectureTemplate } from './data/templates';

export default function App() {
  const [view, setView] = useState<AppView>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [draftProject, setDraftProject] = useState<Project | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<AWSRegion>('us-east-1');

  // Load saved projects on first render
  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const handleNavigate = useCallback((v: AppView, projectId?: string) => {
    setView(v);
    if (v === 'edit' && projectId) {
      setEditingProjectId(projectId);
      setDraftProject(null);
    } else if (v === 'create') {
      setEditingProjectId(null);
      // keep draftProject if already set (e.g. from template)
    } else {
      setEditingProjectId(null);
      setDraftProject(null);
    }
  }, []);

  const handleSaveProject = useCallback((project: Project) => {
    const updated = upsertProject(project);
    setProjects(updated);
    setDraftProject(null);
    setEditingProjectId(null);
    setView('dashboard');
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    const updated = deleteProject(id);
    setProjects(updated);
  }, []);

  const handleDuplicateProject = useCallback((id: string) => {
    const updated = duplicateProject(id);
    setProjects(updated);
  }, []);

  const handleClearAll = useCallback(() => {
    clearAllProjects();
    setProjects([]);
  }, []);

  const handleUseTemplate = useCallback((template: ArchitectureTemplate) => {
    const syntheticProject: Project = {
      id: crypto.randomUUID(),
      name: template.name,
      description: template.description,
      region: template.region,
      notes: `Created from ${template.name} architecture template.`,
      services: template.services.map((s) => ({
        id: crypto.randomUUID(),
        config: JSON.parse(JSON.stringify(s.config)),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDraftProject(syntheticProject);
    setEditingProjectId(null);
    setView('create');
  }, []);

  const editingProject = editingProjectId
    ? projects.find((p) => p.id === editingProjectId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Header */}
      <Header
        currentView={view}
        onNavigate={handleNavigate}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
      />

      {/* Main Layout: Sidebar + Main Content */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex">
        {/* Left Navigation Sidebar (desktop) */}
        <Sidebar
          currentView={view}
          onNavigate={handleNavigate}
          savedCount={projects.length}
        />

        {/* Dynamic Center Main Area */}
        <main className="flex-1 min-w-0 py-6 md:pl-6">
          {(view === 'dashboard' || view === 'saved') && (
            <Dashboard
              projects={projects}
              selectedRegion={selectedRegion}
              onNavigate={handleNavigate}
              onDelete={handleDeleteProject}
              onDuplicate={handleDuplicateProject}
              onClearAll={handleClearAll}
              onUseTemplate={handleUseTemplate}
            />
          )}

          {view === 'templates' && (
            <TemplatesPage
              onUseTemplate={handleUseTemplate}
              onCancel={() => setView('dashboard')}
            />
          )}

          {(view === 'create' || view === 'edit') && (
            <CreateEstimate
              existingProject={view === 'edit' ? editingProject : draftProject}
              onSave={handleSaveProject}
              onCancel={() => {
                setDraftProject(null);
                setEditingProjectId(null);
                setView('dashboard');
              }}
            />
          )}

          {view === 'agent' && (
            <CostWatchAgentPage projects={projects} onNavigate={handleNavigate} />
          )}

          {view === 'learn' && <LearnPage />}
        </main>
      </div>

      {/* Subtle Footer */}
      <footer className="text-center py-5 text-slate-500 text-xs border-t border-slate-800/80 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CloudCost Buddy — Educational AWS Cost Estimation & Architecture Assistant</span>
          <p>
            Educational model only.{' '}
            <a
              href="https://calculator.aws/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Use the official AWS Pricing Calculator
            </a>{' '}
            for contractual quotes.
          </p>
        </div>
      </footer>
    </div>
  );
}
