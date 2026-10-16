import React, { useState } from 'react';
import { Compass, CalendarCheck, Users, Cloud, CloudOff, Share2, Check, ExternalLink } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isLiveApi, pendingCount, flyerAlertCount }) {
  const [copied, setCopied] = useState(false);

  const getVolunteerUrl = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('view', 'volunteer');
      return url.toString();
    }
    return '';
  };

  const handleCopyVolunteerLink = () => {
    const url = getVolunteerUrl();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // If in Volunteer Portal mode: show clean, uncluttered volunteer header
  if (activeTab === 'volunteer') {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">Jeevitnadi</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800 border border-teal-200">
                    Guide & Volunteer Portal
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Walk Availability & Registration Form</p>
              </div>
            </div>

            {/* Right: Switch to Coordinator (discreet) */}
            <button
              onClick={() => setActiveTab('coordinator')}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              Coordinator View →
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Coordinator View: Full command center controls + 1-Click Copy Volunteer Link
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Jeevitnadi</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Coordinator Command Center
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Annual Walks, Guide Allocation & Flyers</p>
            </div>
          </div>

          {/* Quick Actions for Coordinator */}
          <div className="flex items-center gap-2.5">
            {/* Copy Volunteer Form Link button */}
            <button
              onClick={handleCopyVolunteerLink}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                copied
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-xs'
              }`}
              title="Copy the direct link for volunteers to fill their availability"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Volunteer Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Copy Volunteer Link</span>
                </>
              )}
            </button>

            {/* Preview Volunteer Portal button */}
            <button
              onClick={() => setActiveTab('volunteer')}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <span>Preview Form</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            {/* Cloud Status / Settings Trigger */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                isLiveApi
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="Click to configure live Google Sheet Apps Script API"
            >
              {isLiveApi ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold">Google Cloud Connected</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Settings / Mock Mode</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
