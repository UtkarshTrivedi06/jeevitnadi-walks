import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import CoordinatorDashboard from './components/CoordinatorDashboard';
import VolunteerPortal from './components/VolunteerPortal';
import Settings from './components/Settings';
import { fetchAllData, getApiUrl } from './services/api';

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const walkDate = new Date(dateStr);
  walkDate.setHours(0, 0, 0, 0);
  return Math.round((walkDate - today) / (1000 * 60 * 60 * 24));
}

function getInitialTab() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const hash = window.location.hash.replace('#', '');
    if (view === 'volunteer' || hash === 'volunteer' || window.location.pathname.includes('/volunteer')) {
      return 'volunteer';
    }
    if (view === 'settings' || hash === 'settings') {
      return 'settings';
    }
  }
  return 'coordinator';
}

export default function App() {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [data, setData] = useState({ walks: [], resourcePersons: [], availability: [], pendingVolunteers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [apiUrl, setApiUrlState] = useState(getApiUrl());

  // Keep URL in sync with active tab
  const switchTab = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.history?.pushState) {
      const url = new URL(window.location.href);
      if (tab === 'coordinator') {
        url.searchParams.delete('view');
        url.hash = '';
      } else {
        url.searchParams.set('view', tab);
        url.hash = tab;
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchAllData();
      setData({
        walks: result.walks || [],
        resourcePersons: result.resourcePersons || [],
        availability: result.availability || [],
        pendingVolunteers: result.pendingVolunteers || []
      });
    } catch (e) {
      console.error('Data load error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isLiveApi = Boolean(apiUrl && apiUrl.startsWith('http'));

  // Count alerts for navbar badge
  const upcomingWalks = data.walks.filter(w => daysUntil(w.Date) >= 0);
  const flyerAlertCount = upcomingWalks.filter(w => daysUntil(w.Date) <= 14 && w.Flyer_Status !== 'Published').length;
  const pendingCount = (data.pendingVolunteers || []).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      <Navbar
        activeTab={activeTab}
        setActiveTab={switchTab}
        isLiveApi={isLiveApi}
        pendingCount={pendingCount}
        flyerAlertCount={flyerAlertCount}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading Jeevitnadi Walk Data...</p>
        </div>
      ) : (
        <>
          {activeTab === 'coordinator' && (
            <CoordinatorDashboard
              walks={data.walks}
              resourcePersons={data.resourcePersons}
              availability={data.availability}
              pendingVolunteers={data.pendingVolunteers}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'volunteer' && (
            <VolunteerPortal
              walks={upcomingWalks}
              resourcePersons={data.resourcePersons}
              availability={data.availability}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              isLiveApi={isLiveApi}
              onUrlChange={(url) => {
                setApiUrlState(url);
                loadData();
              }}
            />
          )}
        </>
      )}

      {/* Footer */}
      <footer className="text-center py-8 mt-auto">
        <p className="text-xs text-slate-400 font-medium">
          🌊 Jeevitnadi Walk Management System · Built with ❤️ for river conservation
        </p>
      </footer>
    </div>
  );
}
