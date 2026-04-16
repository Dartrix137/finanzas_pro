
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectsView from './components/ProjectsView';
import PortfolioView from './components/PortfolioView';
import GoalsView from './components/GoalsView';
import Login from './components/Login';
import { ViewState, Project, MonthlyGoal, User } from './types';
import { MOCK_PROJECTS, MOCK_GOALS } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('finpro_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Projects remain global for this example, but goals will be user-specific
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('finpro_projects');
    return saved ? JSON.parse(saved) : MOCK_PROJECTS;
  });

  // Initialize goals with a default, but it will be overridden by the useEffect
  const [goals, setGoals] = useState<MonthlyGoal[]>(MOCK_GOALS);

  // Synchronize goals based on current user
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`finpro_goals_${currentUser.id}`);
      if (saved) {
        setGoals(JSON.parse(saved));
      } else {
        // Reset to default mock goals if this specific user has no saved data
        setGoals([...MOCK_GOALS]);
      }
    }
  }, [currentUser?.id]);

  // Save goals to user-specific storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`finpro_goals_${currentUser.id}`, JSON.stringify(goals));
    }
  }, [goals, currentUser?.id]);

  useEffect(() => {
    localStorage.setItem('finpro_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('finpro_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('finpro_user');
    }
  }, [currentUser]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as ViewState;
    if (['dashboard', 'proyectos', 'cartera', 'metas'].includes(hash)) {
      setCurrentView(hash);
    }
  }, []);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    window.location.hash = view;
    setIsMobileMenuOpen(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard');
    window.location.hash = 'dashboard';
  };

  const handleAddProject = (newProject: Omit<Project, 'id' | 'paid' | 'status'>) => {
    const project: Project = {
      ...newProject,
      id: Math.random().toString(36).substr(2, 9),
      paid: 0,
      status: 'pendiente'
    };
    setProjects([project, ...projects]);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleUpdatePaid = (id: string, amount: number) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        const newPaid = Math.min(p.paid + amount, p.amount);
        return { 
          ...p, 
          paid: newPaid, 
          status: newPaid >= p.amount ? 'pagado' : 'facturado' 
        };
      }
      return p;
    }));
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'dark bg-background-dark' : 'bg-background-light'}`}>
      {/* Mobile Overlay */}
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
      
      <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-y-auto custom-scrollbar">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-icons-round text-background-dark text-sm">payments</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">FinanzasPro</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <span className="material-icons-round">menu</span>
          </button>
        </div>

        {currentView === 'dashboard' && (
          <Dashboard 
            onNavigate={handleNavigate} 
            projects={projects} 
            goals={goals} 
          />
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
          <GoalsView 
            goals={goals}
            setGoals={setGoals}
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
