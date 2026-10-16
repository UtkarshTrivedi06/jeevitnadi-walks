import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, UserCheck, Send, Check, Leaf } from 'lucide-react';
import { submitAvailability } from '../services/api';

// Stagger helpers
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function VolunteerPortal({ walks, resourcePersons, availability, onRefresh }) {
  const [volunteerType, setVolunteerType]   = useState('existing');
  const [selectedPerson, setSelectedPerson] = useState(resourcePersons[0]?.Full_Name || '');
  const [phoneDigits, setPhoneDigits]       = useState('');
  const [newName, setNewName]               = useState('');
  const [newPhone, setNewPhone]             = useState('');
  const [newEmail, setNewEmail]             = useState('');
  const [newExpertise, setNewExpertise]     = useState('Bird Watching & Biodiversity');
  const [responses, setResponses]           = useState({});
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(null);

  const handleToggle = (walkId, isFree) => {
    setResponses(prev => ({ ...prev, [walkId]: isFree }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const effectiveName  = volunteerType === 'existing' ? selectedPerson : newName.trim();
    const effectivePhone = volunteerType === 'existing' ? phoneDigits    : newPhone.trim();

    if (!effectiveName) { alert('Please select or enter your name.'); return; }
    if (volunteerType === 'new' && (!effectivePhone || effectivePhone.length < 10)) {
      alert('Please enter a valid 10-digit phone number.'); return;
    }
    if (Object.keys(responses).length === 0) {
      alert('Please mark at least one walk as Free or Busy.'); return;
    }

    setIsSubmitting(true);
    try {
      for (const walkId of Object.keys(responses)) {
        await submitAvailability({
          walkId,
          personName: effectiveName,
          phone: effectivePhone,
          isAvailable: responses[walkId],
          isNewVolunteer: volunteerType === 'new',
          expertise: volunteerType === 'new' ? newExpertise : '',
          email: volunteerType === 'new' ? newEmail : '',
        });
      }
      setSubmittedMessage(`Thank you, ${effectiveName}! Your availability has been logged.`);
      if (onRefresh) onRefresh();
      setTimeout(() => setSubmittedMessage(null), 6000);
    } catch {
      alert('Failed to save availability. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-[#d1e9e5] bg-white text-sm font-medium text-[#0f2924] focus:ring-2 focus:ring-[#14a898] focus:outline-none transition-all placeholder-[#a0bcb8]';
  const labelClass = 'block text-xs font-bold text-[#0f2924] mb-1.5 uppercase tracking-wide';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#d1faf5] text-[#0a3d2e] border border-[#a7e6df] mb-4"
        >
          <Leaf className="w-3.5 h-3.5 text-[#16a34a]" />
          Guide & Volunteer Portal
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f2924] tracking-tight leading-tight">
          Mark Your{' '}
          <span className="text-shimmer">Availability</span>
        </h1>
        <p className="mt-3 text-sm text-[#4a7065] max-w-md mx-auto leading-relaxed">
          Help Jeevitnadi lock in expert guides and release publicity flyers 2 weeks in advance.
        </p>
      </motion.div>

      {/* ── Success banner ── */}
      <AnimatePresence>
        {submittedMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{   opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mb-6 p-4 rounded-2xl bg-[#d1faf5] border border-[#a7e6df] flex items-center gap-3 shadow-md shadow-emerald-700/10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="w-9 h-9 rounded-full bg-[#0f7a6e] text-white flex items-center justify-center shrink-0"
            >
              <Check className="w-5 h-5" />
            </motion.div>
            <div>
              <p className="font-bold text-sm text-[#0a3d2e]">{submittedMessage}</p>
              <p className="text-xs text-[#4a7065] mt-0.5">The coordination team will review your schedule shortly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 1: Identity ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="card-surface rounded-2xl p-6 mb-6"
      >
        <h2 className="text-sm font-extrabold text-[#0f2924] mb-5 flex items-center gap-2 uppercase tracking-wide">
          <UserCheck className="w-4 h-4 text-[#0f7a6e]" />
          Step 1 — Who is filling this?
        </h2>

        {/* Tab toggle */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#eef8f5] rounded-xl mb-6">
          {[
            { key: 'existing', label: 'Existing Guide' },
            { key: 'new',      label: 'New Volunteer'  },
          ].map(tab => (
            <motion.button
              key={tab.key}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setVolunteerType(tab.key)}
              className={`relative py-2.5 px-4 text-xs font-bold rounded-lg transition-colors ${
                volunteerType === tab.key ? 'text-[#0a3d2e]' : 'text-[#4a7065] hover:text-[#0a3d2e]'
              }`}
            >
              {volunteerType === tab.key && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-[#d1e9e5]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {volunteerType === 'existing' ? (
            <motion.div
              key="existing"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{   opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className={labelClass}>Your Name</label>
                <select value={selectedPerson} onChange={e => setSelectedPerson(e.target.value)} className={inputClass}>
                  {resourcePersons.map(rp => (
                    <option key={rp.Person_ID} value={rp.Full_Name}>
                      {rp.Full_Name} ({rp.Expertise || 'Guide'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Last 4 Digits of Phone</label>
                <input
                  type="text"
                  placeholder="e.g. 2345"
                  maxLength={4}
                  value={phoneDigits}
                  onChange={e => setPhoneDigits(e.target.value)}
                  className={inputClass}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="new"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{   opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name <span className="text-rose-500 normal-case">*</span></label>
                  <input type="text" placeholder="Rahul Verma" value={newName} onChange={e => setNewName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>WhatsApp Number <span className="text-rose-500 normal-case">*</span></label>
                  <input type="tel" placeholder="+91 98811 22334" value={newPhone} onChange={e => setNewPhone(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email (Optional)</label>
                  <input type="email" placeholder="name@gmail.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Area of Interest</label>
                  <select value={newExpertise} onChange={e => setNewExpertise(e.target.value)} className={inputClass}>
                    <option>Bird Watching & Biodiversity</option>
                    <option>Botany & Riparian Native Flora</option>
                    <option>River Hydrology & Cleanups</option>
                    <option>Heritage Ghat History & Architecture</option>
                    <option>General Walk Coordinator</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-[#4a7065] italic">
                New volunteers are reviewed and contacted on WhatsApp by Shubha before assignment.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Step 2: Walk Cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold text-[#0f2924] flex items-center gap-2 uppercase tracking-wide">
            <Calendar className="w-4 h-4 text-[#0f7a6e]" />
            Step 2 — Mark Your Availability
          </h2>
          <span className="text-xs text-[#4a7065] font-semibold px-2.5 py-1 bg-[#eef8f5] rounded-full border border-[#d1e9e5]">
            {walks.length} walks
          </span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {walks.map(walk => {
            const isFree = responses[walk.Walk_ID];
            const selected = isFree !== undefined;
            const niceDate = new Date(walk.Date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

            return (
              <motion.div
                key={walk.Walk_ID}
                variants={itemVariants}
                whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(10,61,46,0.1)' }}
                className={`rounded-2xl border p-5 transition-all duration-200 ${
                  isFree === true
                    ? 'border-[#0f7a6e] bg-gradient-to-br from-[#f0fdf4] to-[#d1faf5] shadow-md shadow-emerald-700/10'
                    : isFree === false
                    ? 'border-slate-200 bg-slate-50/60 opacity-75'
                    : 'card-surface hover:border-[#a7e6df]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Info */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#0f2924] text-base">{walk.Walk_Name}</span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#d1faf5] text-[#0f7a6e] border border-[#a7e6df] shrink-0">
                        {niceDate}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#4a7065]">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{walk.Time_Slot}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{walk.Location}</span>
                    </div>
                    <p className="text-xs text-[#0f7a6e] font-semibold">{walk.Topic}</p>
                  </div>

                  {/* Toggle buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => handleToggle(walk.Walk_ID, true)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        isFree === true
                          ? 'bg-[#0f7a6e] text-white shadow-lg shadow-emerald-700/25 ring-2 ring-[#0f7a6e]/30'
                          : 'bg-white text-[#0f7a6e] border border-[#a7e6df] hover:bg-[#d1faf5]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I'm Free</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => handleToggle(walk.Walk_ID, false)}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isFree === false
                          ? 'bg-rose-100 text-rose-700 border border-rose-300 shadow-xs'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Busy</span>
                    </motion.button>
                  </div>
                </div>

                {/* Selection flash bar */}
                <AnimatePresence>
                  {selected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{   height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className={`mt-3 pt-3 border-t text-xs font-semibold flex items-center gap-1.5 ${
                        isFree === true
                          ? 'border-[#a7e6df] text-[#0f7a6e]'
                          : 'border-slate-200 text-slate-400'
                      }`}>
                        {isFree === true ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> Marked as available — great!</>
                        ) : (
                          <><XCircle className="w-3.5 h-3.5" /> Marked as busy</>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom spacer so last card clears the fixed bar */}
        <div className="h-24" />
      </motion.div>

      {/* ── Fixed submit bar ── */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 pointer-events-none"
      >
        <div className="glass-card rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-4 shadow-2xl shadow-emerald-950/20 border border-white/70 backdrop-blur-xl pointer-events-auto">
          <div className="text-xs text-[#4a7065]">
            <span className="text-lg font-extrabold text-[#0f2924]">{Object.keys(responses).length}</span>
            <span className="ml-1">/ {walks.length} walks marked</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-press flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-700/25 transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0f7a6e 0%, #16a34a 100%)' }}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Saving...' : 'Submit Availability'}</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
