/**
 * Local Storage Helpers
 *
 * All saved-project persistence goes through these functions.
 * The rest of the app never touches localStorage directly,
 * which makes it easy to:
 *   - swap to IndexedDB or a backend later
 *   - handle missing / corrupt data in one place
 */

import type { Project } from '../../types';
import { INITIAL_SEED_PROJECTS } from '../../data/seedData';

const STORAGE_KEY = 'cloudcost-buddy-projects';

/**
 * Load all saved projects from localStorage.
 * Returns initial seed projects on first visit, or empty array if user cleared.
 */
export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      saveProjects(INITIAL_SEED_PROJECTS);
      return INITIAL_SEED_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Project[];
  } catch {
    console.warn('CloudCost Buddy: Could not read saved projects from localStorage.');
    return [];
  }
}

/**
 * Save the full array of projects to localStorage.
 * Overwrites whatever was there before.
 */
export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('CloudCost Buddy: Could not save projects to localStorage.', e);
  }
}

/** Add or update a project (upsert by id) */
export function upsertProject(project: Project): Project[] {
  const projects = loadProjects();
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx >= 0) {
    projects[idx] = project;
  } else {
    projects.unshift(project); // newest first
  }
  saveProjects(projects);
  return projects;
}

/** Delete a project by id */
export function deleteProject(id: string): Project[] {
  const projects = loadProjects().filter((p) => p.id !== id);
  saveProjects(projects);
  return projects;
}

/** Duplicate a project (new id, appended "(copy)") */
export function duplicateProject(id: string): Project[] {
  const projects = loadProjects();
  const original = projects.find((p) => p.id === id);
  if (!original) return projects;

  const copy: Project = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} (copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  projects.unshift(copy);
  saveProjects(projects);
  return projects;
}

/** Clear everything */
export function clearAllProjects(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

/* ─── Export helpers ─── */

/** Export a single project as a JSON file download */
export function exportProjectJSON(project: Project): void {
  const json = JSON.stringify(project, null, 2);
  downloadFile(json, `${slugify(project.name)}-estimate.json`, 'application/json');
}

/** Export a project's cost breakdown as CSV */
export function exportProjectCSV(
  project: Project,
  costs: { service: string; monthlyCost: number }[],
): void {
  const rows = [
    ['Service', 'Monthly Cost (USD)', 'Annual Cost (USD)'],
    ...costs.map((c) => [c.service, c.monthlyCost.toFixed(2), (c.monthlyCost * 12).toFixed(2)]),
    [
      'TOTAL',
      costs.reduce((s, c) => s + c.monthlyCost, 0).toFixed(2),
      (costs.reduce((s, c) => s + c.monthlyCost, 0) * 12).toFixed(2),
    ],
  ];
  const csv = rows.map((r) => r.join(',')).join('\n');
  downloadFile(csv, `${slugify(project.name)}-breakdown.csv`, 'text/csv');
}

/* ─── Internal helpers ─── */

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
