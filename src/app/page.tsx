'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/finanzaspro/Sidebar';
import Dashboard from '@/components/finanzaspro/Dashboard';
import ProjectsView from '@/components/finanzaspro/ProjectsView';
import PortfolioView from '@/components/finanzaspro/PortfolioView';
import GoalsView from '@/components/finanzaspro/GoalsView';
import Login from '@/components/finanzaspro/Login';
import { ViewState, Project, MonthlyGoal, User } from '@/lib/types';
import { MOCK_PROJECTS, MOCK_GOALS, safeSetItem, safeRemoveItem, safeGetItem } from '@/lib/constants';

/* ── Hook: hash-based navigation ── */
function useHash(): ViewState {
  const [hash, setHash] = useState<ViewState>('dashboard');

  useEffect(() => {
    function onHashChange() {
      const h = window.location.hash.replace('#', '');
      if (['dashboard', 'proyectos', 'cartera', 'metas'].includes(h)) {
        setHash(h as ViewState);
      }
    }
    onHashChange();
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return hash;
}

/* ── Hook: localStorage-backed state (simple, SSR-safe) ── */
function useStoredState<T>(key: string, fallback: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => safeGetItem(key, fallback));

  const wrappedSetValue: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (action) => {
      setValue((prev) => {
        const next = typeof action === 'function' ? (action as (p: T) => T)(prev) : action;
        safeSetItem(key, next);
        return next;
      });
    },
    [key]
  );

  return [value, wrappedSetValue];
}

export default function Home() {
  // ── Auth ──
  const [currentUser, setCurrentUser] = useStoredState<User | null>('finpro_user', null);

  useEffect(() => {
    if (currentUser) {
      safeSetItem('finpro_user', currentUser);
    } else {
      safeRemoveItem('finpro_user');
    }
  }, [currentUser]);

  // ── Navigation ──
  const currentView = useHash();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleNavigate(view: ViewState) {
    window.location.hash = view;
    setIsMobileMenuOpen(false);
  }

  // ── Dark Mode (persists!) ──
  const [isDarkMode, setIsDarkMode] = useStoredState<boolean>('finpro_darkmode', false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  function toggleDarkMode() {
    const next = !isDarkMode;
    setIsDarkMode(next);
    safeSetItem('finpro_darkmode', next);
  }

  // ── Projects ──
  const [projects, setProjects] = useStoredState<Project[]>('finpro_projects', MOCK_PROJECTS);

  // ── Goals (per-user) ──
  const goalKey = currentUser ? `finpro_goals_${currentUser.id}` : '__none__';
  const [goals, setGoals] = useStoredState<MonthlyGoal[]>(goalKey, MOCK_GOALS);

  // ── Handlers ──
  function handleLogin(user: User) {
    setCurrentUser(user);
  }

  function handleLogout() {
    setCurrentUser(null);
    window.location.hash = 'dashboard';
  }

  function handleAddProject(newProject: Omit<Project, 'id' | 'paid' | 'status'>) {
    const project: Project = {
      ...newProject,
      id: Math.random().toString(36).substring(2, 11),
      paid: 0,
      status: 'pendiente',
    };
    setProjects((prev) => [project, ...prev]);
  }

  function handleDeleteProject(id: string) {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  }

  function handleUpdatePaid(id: string, amount: number) {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newPaid = Math.min(p.paid + amount, p.amount);
          let newStatus: Project['status'];
          if (newPaid >= p.amount) {
            newStatus = 'pagado';
          } else if (newPaid > 0) {
            newStatus = 'facturado';
          } else {
            newStatus = p.status;
          }
          return { ...p, paid: newPaid, status: newStatus };
        }
        return p;
      })
    );
  }

  // ── Render ──
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar min-h-screen">
        <div className="lg:hidden flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-icons-round text-primary-foreground text-sm">payments</span>
            </div>
            <span className="font-bold text-foreground text-sm">
              Finanzas<span className="text-primary">Pro</span>
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-card border border-border"
          >
            <span className="material-icons-round text-foreground">menu</span>
          </button>
        </div>

        {currentView === 'dashboard' && (
          <Dashboard onNavigate={handleNavigate} projects={projects} goals={goals} />
        )}
        {currentView === 'proyectos' && (
          <ProjectsView
            projects={projects}
            onAddProject={handleAddProject}
            onUpdatePaid={handleUpdatePaid}
            onDeleteProject={handleDeleteProject}
          />
        )}
        {currentView === 'cartera' && (
          <PortfolioView
            projects={projects}
            onUpdatePaid={handleUpdatePaid}
            onDeleteProject={handleDeleteProject}
          />
        )}
        {currentView === 'metas' && (
          <GoalsView goals={goals} setGoals={setGoals} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        )}
      </main>
    </div>
  );
}
