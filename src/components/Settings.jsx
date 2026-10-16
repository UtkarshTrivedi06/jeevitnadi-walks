import React, { useState } from 'react';
import { Cloud, CloudOff, Save, CheckCircle2, ExternalLink, Info } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Connect this app to your live Google Sheets database.</p>
      </div>

      {/* Status Card */}
      <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
        isLiveApi ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
      }`}>
        {isLiveApi
          ? <Cloud className="w-5 h-5 text-emerald-600 shrink-0" />
          : <CloudOff className="w-5 h-5 text-slate-400 shrink-0" />
        }
        <div>
          <p className={`text-sm font-bold ${isLiveApi ? 'text-emerald-800' : 'text-slate-700'}`}>
            {isLiveApi ? 'Google Sheet Connected (Live Mode)' : 'Running in Mock / Offline Mode'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLiveApi
              ? 'Volunteer submissions and coordinator actions are syncing live to your Google Sheet.'
              : 'All data is stored in your browser\'s localStorage only. Paste the Apps Script URL below to go live.'
            }
          </p>
        </div>
      </div>

      {/* API URL Input */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
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
          <p className="mt-2 text-xs text-slate-500 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            From your Google Apps Script editor → Deploy → New Deployment → Web App → Execute as: Me → Who has access: Anyone → Copy the URL.
          </p>
        </div>

        {/* How-to Steps */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-slate-700 mb-2">⚡ 3-Step Setup (under 2 minutes)</p>
          <ol className="space-y-1.5 text-xs text-slate-600 list-decimal list-inside">
            <li>Go to <strong>sheets.new</strong>, create 4 tabs: <code className="bg-slate-200 px-1 rounded">Walks_Schedule</code>, <code className="bg-slate-200 px-1 rounded">Resource_Persons</code>, <code className="bg-slate-200 px-1 rounded">Availability_Intake</code>, <code className="bg-slate-200 px-1 rounded">Settings</code></li>
            <li>Click <strong>Extensions → Apps Script</strong>, paste the backend <code>Code.gs</code> from the blueprint, then save.</li>
            <li>Click <strong>Deploy → New Deployment → Web App</strong>. Copy the URL and paste it above.</li>
          </ol>
          <a
            href="https://docs.google.com/spreadsheets/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Google Sheets
          </a>
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
            <><CheckCircle2 className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save & Connect</>
          )}
        </button>
      </div>
    </div>
  );
}
