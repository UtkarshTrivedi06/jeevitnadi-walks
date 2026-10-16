import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Cloud, CloudOff, Share2, Check, ExternalLink } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isLiveApi }) {
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

  // ── Volunteer header — completely locked, no coordinator access ──
  if (activeTab === 'volunteer') {
    return (
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-40 glass-card border-b border-white/60"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f7a6e] to-[#16a34a] flex items-center justify-center text-white shadow-lg shadow-emerald-700/20 shrink-0"
            >
              <Compass className="w-5 h-5" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#0f2924] tracking-tight">Jeevitnadi</span>
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 25 }}
                  className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#d1faf5] text-[#0f7a6e] border border-[#a7e6df]"
                >
                  Guide & Volunteer Portal
                </motion.span>
              </div>
              <p className="text-xs text-[#4a7065] font-medium">Walk Availability & Registration</p>
            </div>
          </div>
        </div>
      </motion.header>
    );
  }

  // ── Coordinator header ──
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 glass-card border-b border-white/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 20, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f7a6e] to-[#16a34a] flex items-center justify-center text-white shadow-lg shadow-emerald-700/20"
            >
              <Compass className="w-5 h-5" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#0f2924] tracking-tight">Jeevitnadi</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#d1faf5] text-[#0a3d2e] border border-[#a7e6df]">
                  Command Center
                </span>
              </div>
              <p className="text-xs text-[#4a7065] font-medium">Walks · Guides · Flyers</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Copy Volunteer Link */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleCopyVolunteerLink}
              className="btn-press flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors shadow-xs"
              style={copied
                ? { background: '#d1faf5', color: '#0a3d2e', borderColor: '#a7e6df' }
                : { background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }
              }
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="copied"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Link Copied!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Volunteer Link
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Preview Portal */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab('volunteer')}
              className="btn-press hidden sm:flex items-center gap-1 text-xs font-semibold text-[#4a7065] hover:text-[#0f2924] px-3 py-2 rounded-xl border border-[#d1e9e5] hover:bg-[#eef8f5] transition-colors"
            >
              Preview Form <ExternalLink className="w-3 h-3" />
            </motion.button>

            {/* API Status pill */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab('settings')}
              className={`btn-press flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                isLiveApi
                  ? 'bg-[#d1faf5] text-[#0a3d2e] border-[#a7e6df]'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isLiveApi ? (
                <><Cloud className="w-3.5 h-3.5 text-[#0f7a6e]" /> Live</>
              ) : (
                <><CloudOff className="w-3.5 h-3.5 text-slate-400" /> Offline</>
              )}
            </motion.button>

          </div>
        </div>
      </div>
    </motion.header>
  );
}
