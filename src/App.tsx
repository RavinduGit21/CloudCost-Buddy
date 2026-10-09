/**
 * App.tsx — Root component & simple router
 *
 * Instead of installing react-router (another dependency),
 * we use a single piece of React state called `view` to
 * decide which page to render.  This keeps the app simple.
 */

import { useState, useCallback, useEffect } from 'react';
import type { AppView, Project } from './types';
import { loadProjects, upsertProject, deleteProject, duplicateProject, clearAllProjects } from './features/storage/estimateStorage';
import Dashboard from './pages/Dashboard';
import CreateEstimate from './pages/CreateEstimate';
import LearnPage from './pages/LearnPage';
import Header from './components/Header';

export default function App() {
  const [view, setView] = useState<AppView>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Load saved projects on first render
  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const handleNavigate = useCallback((v: AppView, projectId?: string) => {
    setView(v);
    if (v === 'edit' && projectId) {
      setEditingProjectId(projectId);
    } else {
      setEditingProjectId(null);
    }
  }, []);

  const handleSaveProject = useCallback((project: Project) => {
    const updated = upsertProject(project);
    setProjects(updated);
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

  const editingProject = editingProjectId
    ? projects.find((p) => p.id === editingProjectId) ?? null
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentView={view} onNavigate={handleNavigate} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'dashboard' && (
          <Dashboard
            projects={projects}
            onNavigate={handleNavigate}
            onDelete={handleDeleteProject}
            onDuplicate={handleDuplicateProject}
            onClearAll={handleClearAll}
          />
        )}

        {(view === 'create' || view === 'edit') && (
          <CreateEstimate
            existingProject={view === 'edit' ? editingProject : null}
            onSave={handleSaveProject}
            onCancel={() => setView('dashboard')}
          />
        )}

        {view === 'learn' && (
          <LearnPage />
        )}
      </main>

      <footer className="text-center py-6 text-text-muted text-sm border-t border-border-default">
        <p>
          CloudCost Buddy — Educational cost estimation tool.{' '}
          <a
            href="https://calculator.aws/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-blue hover:underline"
          >
            Use the official AWS Pricing Calculator
          </a>{' '}
          for verified estimates.
        </p>
      </footer>
    </div>
  );
}
