import React, { useState } from 'react';
import { Cloud, CloudOff, Save, CheckCircle2 } from 'lucide-react';
import { getApiUrl, setApiUrl } from '../services/api';

export default function Settings({ isLiveApi, onUrlChange }) {
  const [apiUrl, setLocalApiUrl] = useState(getApiUrl());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiUrl(apiUrl.trim());
    onUrlChange(apiUrl.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Connect this dashboard to your live Google Sheet.</p>
      </div>

      {/* Connection Status */}
      <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
        isLiveApi ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
      }`}>
        {isLiveApi
          ? <Cloud className="w-5 h-5 text-emerald-600 shrink-0" />
          : <CloudOff className="w-5 h-5 text-slate-400 shrink-0" />
        }
        <div>
          <p className={`text-sm font-bold ${isLiveApi ? 'text-emerald-800' : 'text-slate-700'}`}>
            {isLiveApi ? 'Connected — Live Google Sheet Sync Active' : 'Not Connected — Running in Offline Mode'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLiveApi
              ? 'All changes sync directly to your Google Sheet in real time.'
              : 'Data is stored in your browser only. Paste the Apps Script URL below to go live.'
            }
          </p>
        </div>
      </div>

      {/* URL Input */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">
            Google Apps Script Web App URL
          </label>
          <input
            type="url"
            value={apiUrl}
            onChange={e => setLocalApiUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            saved
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20 hover:opacity-90'
          }`}
        >
          {saved ? (
            <><CheckCircle2 className="w-4 h-4" /> Connected!</>
          ) : (
            <><Save className="w-4 h-4" /> Save & Connect</>
          )}
        </button>
      </div>
    </div>
  );
}
