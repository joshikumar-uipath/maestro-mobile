import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import type { UiPathSDKConfig } from '@uipath/uipath-typescript/core';
import { HomeView } from './components/HomeView';
import { ProcessList } from './components/ProcessList';
import { InstanceList } from './components/InstanceList';
import { CaseList } from './components/CaseList';
import { TaskList } from './components/TaskList';
import './index.css';

const authConfig: UiPathSDKConfig = {
  clientId: import.meta.env.VITE_UIPATH_CLIENT_ID,
  orgName: import.meta.env.VITE_UIPATH_ORG_NAME,
  tenantName: import.meta.env.VITE_UIPATH_TENANT_NAME,
  baseUrl: import.meta.env.VITE_UIPATH_BASE_URL,
  redirectUri: window.location.origin,
  scope: import.meta.env.VITE_UIPATH_SCOPES,
};

type Tab = 'home' | 'processes' | 'agentic' | 'cases' | 'tasks';

const tabs: { id: Tab; label: string; svgPath: string }[] = [
  {
    id: 'home',
    label: 'Home',
    svgPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    id: 'processes',
    label: 'Automations',
    svgPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    id: 'agentic',
    label: 'Agentic',
    svgPath: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2',
  },
  {
    id: 'cases',
    label: 'Cases',
    svgPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    svgPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
];

// ── Drawer ────────────────────────────────────────────────────────────────────
function Drawer({
  open, activeTab, onNavigate, onClose, onLogout, orgName, tenantName,
}: {
  open: boolean;
  activeTab: Tab;
  onNavigate: (tab: Tab) => void;
  onClose: () => void;
  onLogout: () => void;
  orgName: string;
  tenantName: string;
}) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/25" onClick={onClose} />}
      <div
        className={`fixed top-0 left-0 h-full z-50 w-72 bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center shadow-sm shadow-green-200">
              <svg className="w-[18px] h-[18px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">Pulse</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">Navigation</p>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { onNavigate(tab.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-colors ${
                  isActive ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
              >
                <svg
                  className={`w-5 h-5 shrink-0 ${isActive ? 'text-green-600' : 'text-gray-400'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2 : 1.5} d={tab.svgPath} />
                </svg>
                <span className={`text-sm ${isActive ? 'font-semibold text-green-700' : 'font-medium text-gray-600'}`}>
                  {tab.label}
                </span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />}
              </button>
            );
          })}

          <div className="my-3 h-px bg-gray-100" />

          <button
            onClick={() => { onClose(); onLogout(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm font-medium text-red-600">Sign out</span>
          </button>
        </div>

        {/* Workspace */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Workspace</p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-green-700">{(orgName[0] ?? 'O').toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{orgName}</p>
              <p className="text-xs text-gray-400 truncate">{tenantName}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────
function TopBar({ onHamburger }: { onHamburger: () => void }) {
  return (
    <header className="bg-white border-b border-gray-100 shrink-0 flex items-center px-4 justify-between" style={{ height: '56px' }}>
      <button
        onClick={onHamburger}
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center shadow-sm shadow-green-200">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span className="text-sm font-bold text-gray-900">Pulse</span>
      </div>

      <button className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors relative">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>
    </header>
  );
}

// ── BottomNav ─────────────────────────────────────────────────────────────────
function BottomNav({ activeTab, onNavigate }: { activeTab: Tab; onNavigate: (tab: Tab) => void }) {
  return (
    <nav className="shrink-0 bg-white border-t border-gray-100" style={{ height: '60px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex h-full">
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          const isTaskTab = tab.id === 'tasks';
          const activeColor = isTaskTab ? 'text-blue-500' : 'text-green-600';
          const dotColor = isTaskTab ? 'bg-blue-500' : 'bg-green-500';
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors"
            >
              {active && <span className={`absolute top-1.5 w-1 h-1 rounded-full ${dotColor}`} />}
              <svg
                className={`w-5 h-5 transition-colors ${active ? activeColor : 'text-gray-400'}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d={tab.svgPath} />
              </svg>
              <span className={`text-[10px] font-semibold transition-colors leading-tight ${active ? activeColor : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ── AppContent ────────────────────────────────────────────────────────────────
function AppContent() {
  const { isAuthenticated, isLoading, login, logout, error, sdk } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-green-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-xl p-8">

            {/* Logo */}
            <div className="flex items-center justify-center mb-7">
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-1.5 tracking-tight">Pulse</h1>
            <p className="text-sm text-gray-400 text-center mb-7 leading-relaxed">
              Monitor everything live, like a heartbeat
            </p>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={login}
              className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3.5 px-6 rounded-2xl transition-colors shadow-md shadow-green-200"
            >
              Sign in with UiPath
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">Powered by UiPath Orchestrator</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto">
      <TopBar onHamburger={() => setDrawerOpen(true)} />

      <Drawer
        open={drawerOpen}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onClose={() => setDrawerOpen(false)}
        onLogout={logout}
        orgName={sdk.config.orgName || ''}
        tenantName={sdk.config.tenantName || ''}
      />

      <main className="flex-1 overflow-hidden">
        {activeTab === 'home' && <HomeView onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'processes' && <ProcessList />}
        {activeTab === 'agentic' && <InstanceList />}
        {activeTab === 'cases' && <CaseList />}
        {activeTab === 'tasks' && <TaskList />}
      </main>

      <BottomNav activeTab={activeTab} onNavigate={setActiveTab} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider config={authConfig}>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
