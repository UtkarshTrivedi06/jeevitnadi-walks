import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays, AlertTriangle, Bell, User, Check, ChevronDown, MapPin, Clock,
  ExternalLink, Flag, MessageCircle, UserPlus, ShieldCheck, Trash2, Plus, X
} from 'lucide-react';
import { assignWalkLeader, updateFlyerStatus, approveNewVolunteer, dismissNewVolunteer, addNewWalk } from '../services/api';

function daysUntil(dateStr) {
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const walkDate = new Date(dateStr); walkDate.setHours(0, 0, 0, 0);
  return Math.round((walkDate - today) / (1000 * 60 * 60 * 24));
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-[#d1e9e5] bg-white text-sm font-medium text-[#0f2924] focus:ring-2 focus:ring-[#14a898] focus:outline-none transition-all placeholder-[#a0bcb8]';
const labelClass = 'block text-xs font-bold text-[#0f2924] mb-1.5 uppercase tracking-wide';

export default function CoordinatorDashboard({ walks, resourcePersons, availability, pendingVolunteers, onRefresh }) {
  const [openAssignId, setOpenAssignId]     = useState(null);
  const [showAddWalkModal, setShowAddWalkModal] = useState(false);
  const [newWalk, setNewWalk]               = useState({ walkName: 'Nature & Biodiversity Walk', date: '', timeSlot: '07:00 AM - 09:00 AM', location: '', topic: '' });
  const [isSaving, setIsSaving]             = useState(false);
  const [toast, setToast]                   = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const availMap = {};
  availability.forEach(a => {
    if (!availMap[a.Walk_ID]) availMap[a.Walk_ID] = [];
    availMap[a.Walk_ID].push(a);
  });

  const upcomingWalks = walks
    .filter(w => daysUntil(w.Date) >= 0)
    .sort((a, b) => new Date(a.Date) - new Date(b.Date));

  const flyerAlerts     = upcomingWalks.filter(w => daysUntil(w.Date) <= 14 && w.Flyer_Status !== 'Published');
  const unassignedAlerts = upcomingWalks.filter(w => w.Assigned_Leader === 'UNASSIGNED' && daysUntil(w.Date) <= 30);

  const handleAssignLeader = async (walkId, leaderName) => {
    setIsSaving(true);
    await assignWalkLeader(walkId, leaderName);
    setOpenAssignId(null);
    showToast(`Leader assigned: ${leaderName}`);
    if (onRefresh) onRefresh();
    setIsSaving(false);
  };

  const getPersonDetails = name =>
    resourcePersons.find(rp => (rp.Full_Name || '').toLowerCase() === (name || '').toLowerCase()) ||
    { Full_Name: name, Expertise: 'Volunteer Guide', Phone: '' };

  const handleFlyerToggle = async (walkId, currentStatus) => {
    const next = currentStatus === 'Published' ? 'Draft' : 'Published';
    await updateFlyerStatus(walkId, next);
    showToast(`Flyer marked as ${next}`);
    if (onRefresh) onRefresh();
  };

  const handleApprove = async (id, name) => {
    await approveNewVolunteer(id);
    showToast(`${name} approved & added to guide pool!`);
    if (onRefresh) onRefresh();
  };

  const handleDismiss = async (id, name) => {
    await dismissNewVolunteer(id);
    showToast(`${name} dismissed.`, 'neutral');
    if (onRefresh) onRefresh();
  };

  const handleAddWalk = async () => {
    if (!newWalk.date) { alert('Please select a walk date.'); return; }
    setIsSaving(true);
    await addNewWalk(newWalk);
    setShowAddWalkModal(false);
    setNewWalk({ walkName: 'Nature & Biodiversity Walk', date: '', timeSlot: '07:00 AM - 09:00 AM', location: '', topic: '' });
    showToast('New walk added to schedule!');
    if (onRefresh) onRefresh();
    setIsSaving(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{   opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={`fixed top-20 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-[#0f7a6e] text-white'
                : 'bg-[#0f2924] text-white'
            }`}
          >
            <Check className="w-4 h-4" /> {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-[#0f2924] tracking-tight">Walk Command Center</h1>
          <p className="text-sm text-[#4a7065] mt-0.5">Assign leaders, track flyers, manage upcoming walks.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowAddWalkModal(true)}
          className="btn-press flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg shadow-emerald-700/20"
          style={{ background: 'linear-gradient(135deg, #0f7a6e 0%, #16a34a 100%)' }}
        >
          <Plus className="w-4 h-4" /> Plan New Walk
        </motion.button>
      </motion.div>

      {/* ── Urgent alerts ── */}
      <AnimatePresence>
        {(flyerAlerts.length > 0 || unassignedAlerts.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: 12 }}
            className="mb-8 space-y-3"
          >
            {flyerAlerts.map(w => {
              const days = daysUntil(w.Date);
              return (
                <motion.div
                  key={`flyer-${w.Walk_ID}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs"
                >
                  <div className="flex items-center gap-2 text-amber-800 shrink-0">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </motion.div>
                    <span className="font-extrabold text-sm">{days === 0 ? 'TODAY' : `${days}d left`}</span>
                  </div>
                  <p className="text-sm text-amber-900 font-medium flex-1">
                    <strong>{w.Walk_Name}</strong> on <strong>{w.Date}</strong> — Flyer still <em>{w.Flyer_Status}</em>. Share on Instagram & WhatsApp now!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleFlyerToggle(w.Walk_ID, w.Flyer_Status)}
                    className="btn-press shrink-0 text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm shadow-amber-500/30"
                  >
                    Mark Published ✓
                  </motion.button>
                </motion.div>
              );
            })}
            {unassignedAlerts.map(w => (
              <motion.div
                key={`assign-${w.Walk_ID}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs"
              >
                <div className="flex items-center gap-2 text-rose-800 shrink-0">
                  <Bell className="w-5 h-5 text-rose-500" />
                  <span className="font-extrabold text-sm">{daysUntil(w.Date)}d</span>
                </div>
                <p className="text-sm text-rose-900 font-medium flex-1">
                  <strong>{w.Walk_Name}</strong> on <strong>{w.Date}</strong> — No resource person assigned yet!
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setOpenAssignId(w.Walk_ID)}
                  className="btn-press shrink-0 text-xs font-bold px-3.5 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm shadow-rose-600/30"
                >
                  Assign Leader →
                </motion.button>
              </motion.div>
            ))}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Pending volunteers ── */}
      <AnimatePresence>
        {pendingVolunteers?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-sm font-extrabold text-[#0f2924] flex items-center gap-2 mb-4 uppercase tracking-wide">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              New Volunteer Applications
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold"
              >
                {pendingVolunteers.length}
              </motion.span>
            </h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {pendingVolunteers.map(v => (
                <motion.div key={v.id} variants={itemVariants} className="card-surface rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-bold text-[#0f2924]">{v.name}</p>
                      <p className="text-xs text-indigo-600 font-semibold">{v.expertise}</p>
                    </div>
                    <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-200 shrink-0">New</span>
                  </div>
                  <div className="space-y-1 mb-4 text-xs text-[#4a7065]">
                    <p>📞 {v.phone} {v.email && `• 📧 ${v.email}`}</p>
                    <p>Applied for: <span className="font-semibold text-[#0f2924]">{v.walkName}</span></p>
                    <p className="text-[#a0bcb8]">Submitted: {v.submittedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.a
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      href={`https://wa.me/${v.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${v.name}, thanks for registering as a Jeevitnadi walk volunteer!`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0f7a6e] text-white hover:bg-[#0a5c54] transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </motion.a>
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={() => handleApprove(v.id, v.name)}
                      className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#d1faf5] text-[#0a3d2e] border border-[#a7e6df] hover:bg-[#a7e6df] transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                      onClick={() => handleDismiss(v.id, v.name)}
                      className="btn-press p-1.5 rounded-xl text-[#4a7065] hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Walk schedule ── */}
      <section>
        <h2 className="text-sm font-extrabold text-[#0f2924] flex items-center gap-2 mb-5 uppercase tracking-wide">
          <CalendarDays className="w-4 h-4 text-[#0f7a6e]" />
          Upcoming Walks
          <span className="text-[11px] font-semibold text-[#4a7065] normal-case ml-1">({upcomingWalks.length} scheduled)</span>
        </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {upcomingWalks.map(walk => {
            const days         = daysUntil(walk.Date);
            const isUnassigned = walk.Assigned_Leader === 'UNASSIGNED';
            const walkAvail    = availMap[walk.Walk_ID] || [];
            const seenNames    = new Set();
            const availableGuides = [];
            const busyGuides      = [];

            walkAvail.forEach(a => {
              const trimmed = (a.Person_Name || '').trim();
              if (!trimmed || seenNames.has(trimmed.toLowerCase())) return;
              seenNames.add(trimmed.toLowerCase());
              (a.Is_Available === 'YES' ? availableGuides : busyGuides).push(a);
            });

            const otherResourcePersons = resourcePersons.filter(
              rp => rp.Status === 'Active' && !seenNames.has((rp.Full_Name || '').trim().toLowerCase())
            );

            const isOpen = openAssignId === walk.Walk_ID;

            const cardBorder = isUnassigned && days <= 14
              ? 'border-rose-300 bg-rose-50/30'
              : walk.Flyer_Status === 'Published'
              ? 'border-[#a7e6df] bg-[#f0fdf4]/50'
              : 'card-surface';

            return (
              <motion.div
                key={walk.Walk_ID}
                variants={itemVariants}
                whileHover={{ y: -2, boxShadow: '0 10px 40px rgba(10,61,46,0.09)' }}
                className={`rounded-2xl border transition-all duration-200 overflow-visible ${cardBorder}`}
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                    {/* Walk info */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-[#0f2924] text-base">{walk.Walk_Name}</span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                          days === 0 ? 'bg-rose-100 text-rose-700 border-rose-300' :
                          days <= 7  ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-[#eef8f5] text-[#0f7a6e] border-[#d1e9e5]'
                        }`}>
                          {days === 0 ? 'TODAY' : `${days}d away`} · {walk.Date}
                        </span>
                        {/* Flyer badge */}
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          walk.Flyer_Status === 'Published'
                            ? 'bg-[#d1faf5] text-[#0a3d2e] border-[#a7e6df]'
                            : walk.Flyer_Status === 'Draft'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          <Flag className="w-3 h-3" /> {walk.Flyer_Status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-[#4a7065]">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{walk.Time_Slot}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{walk.Location}</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {isUnassigned
                            ? <span className="text-rose-600 font-bold">UNASSIGNED</span>
                            : <span className="text-[#0f7a6e] font-bold">{walk.Assigned_Leader}</span>
                          }
                        </span>
                      </div>
                      <p className="text-xs text-[#0f7a6e] font-semibold">{walk.Topic}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Flyer toggle */}
                      <motion.button
                        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleFlyerToggle(walk.Walk_ID, walk.Flyer_Status)}
                        className={`btn-press flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
                          walk.Flyer_Status === 'Published'
                            ? 'bg-[#d1faf5] text-[#0a3d2e] border-[#a7e6df]'
                            : 'bg-white text-[#4a7065] border-[#d1e9e5] hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        <Flag className="w-3 h-3" />
                        {walk.Flyer_Status === 'Published' ? 'Flyer ✓' : 'Mark Flyer Sent'}
                      </motion.button>

                      {walk.Registration_Link && (
                        <a
                          href={walk.Registration_Link}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl bg-white text-[#4a7065] border border-[#d1e9e5] hover:bg-[#eef8f5] transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> Reg. Link
                        </a>
                      )}

                      {/* Assign dropdown trigger */}
                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                          onClick={() => setOpenAssignId(isOpen ? null : walk.Walk_ID)}
                          className={`btn-press flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                            isUnassigned
                              ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-600/20'
                              : 'bg-white text-[#4a7065] border-[#d1e9e5] hover:border-[#0f7a6e] hover:bg-[#eef8f5]'
                          }`}
                        >
                          <User className="w-3 h-3" />
                          {isUnassigned ? 'Assign Leader' : 'Reassign'}
                          {availableGuides.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-extrabold">
                              {availableGuides.length}
                            </span>
                          )}
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </motion.div>
                        </motion.button>

                        {/* Dropdown */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -8 }}
                              animate={{ opacity: 1, scale: 1,    y: 0  }}
                              exit={{   opacity: 0, scale: 0.95, y: -8 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                              className="absolute right-0 top-full mt-2 z-40 bg-white rounded-2xl border border-[#d1e9e5] shadow-2xl shadow-emerald-900/15 w-80 sm:w-96 p-4 max-h-[28rem] overflow-y-auto"
                            >
                              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#eef8f5]">
                                <div>
                                  <p className="text-xs font-extrabold text-[#0f2924]">Assign Walk Leader</p>
                                  <p className="text-[11px] text-[#4a7065]">Pick from guides who marked themselves free</p>
                                </div>
                                <button
                                  onClick={() => setOpenAssignId(null)}
                                  className="p-1 rounded-lg text-[#4a7065] hover:text-[#0f2924] hover:bg-[#eef8f5] transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Available */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-extrabold text-[#0f7a6e] flex items-center gap-1.5">
                                    <span className="relative flex w-2 h-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0f7a6e] opacity-50"></span>
                                      <span className="relative inline-flex rounded-full w-2 h-2 bg-[#0f7a6e]"></span>
                                    </span>
                                    Available Guides
                                  </span>
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#d1faf5] text-[#0a3d2e]">
                                    {availableGuides.length} free
                                  </span>
                                </div>

                                {availableGuides.length > 0 ? (
                                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-1.5">
                                    {availableGuides.map(avail => {
                                      const details    = getPersonDetails(avail.Person_Name);
                                      const isCurrent  = walk.Assigned_Leader === avail.Person_Name;
                                      return (
                                        <motion.div
                                          key={avail.Person_Name}
                                          variants={itemVariants}
                                          className={`p-3 rounded-xl border transition-all ${
                                            isCurrent
                                              ? 'bg-[#d1faf5] border-[#0f7a6e] ring-1 ring-[#0f7a6e]/30'
                                              : 'bg-[#f0fdf4] border-[#d1e9e5] hover:border-[#0f7a6e] hover:bg-[#d1faf5]'
                                          }`}
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                              <p className="text-xs font-extrabold text-[#0f2924] truncate flex items-center gap-1.5">
                                                {avail.Person_Name}
                                                {isCurrent && (
                                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0f7a6e] text-white">Assigned</span>
                                                )}
                                              </p>
                                              <p className="text-[11px] text-[#0f7a6e] font-medium mt-0.5 truncate">{details.Expertise}</p>
                                              {(details.Phone || avail.Phone) && (
                                                <p className="text-[10px] text-[#a0bcb8] mt-0.5">📞 {details.Phone || avail.Phone}</p>
                                              )}
                                            </div>
                                            {!isCurrent ? (
                                              <motion.button
                                                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                                                onClick={() => handleAssignLeader(walk.Walk_ID, avail.Person_Name)}
                                                disabled={isSaving}
                                                className="btn-press shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0f7a6e] text-white hover:bg-[#0a5c54] shadow-xs transition-colors"
                                              >
                                                Assign →
                                              </motion.button>
                                            ) : (
                                              <Check className="w-4 h-4 text-[#0f7a6e] shrink-0 mt-0.5" />
                                            )}
                                          </div>
                                        </motion.div>
                                      );
                                    })}
                                  </motion.div>
                                ) : (
                                  <p className="text-xs text-[#a0bcb8] italic bg-[#eef8f5] p-3 rounded-xl border border-dashed border-[#d1e9e5] text-center">
                                    No guides have marked themselves available yet.
                                  </p>
                                )}
                              </div>

                              {/* Busy */}
                              {busyGuides.length > 0 && (
                                <div className="mb-4 pt-3 border-t border-[#eef8f5]">
                                  <p className="text-xs font-bold text-[#4a7065] mb-2">Marked Busy</p>
                                  <div className="space-y-1">
                                    {busyGuides.map(bg => (
                                      <div key={bg.Person_Name} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-xs text-slate-500">
                                        <span className="font-semibold">{bg.Person_Name}</span>
                                        <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">Busy</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* All others */}
                              {otherResourcePersons.length > 0 && (
                                <div className="pt-3 border-t border-[#eef8f5]">
                                  <p className="text-xs font-bold text-[#4a7065] mb-2">Other Resource Persons ({otherResourcePersons.length})</p>
                                  <div className="space-y-1">
                                    {otherResourcePersons.map(rp => (
                                      <motion.button
                                        key={rp.Person_ID}
                                        whileHover={{ x: 2 }}
                                        onClick={() => handleAssignLeader(walk.Walk_ID, rp.Full_Name)}
                                        disabled={isSaving}
                                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#eef8f5] border border-transparent hover:border-[#d1e9e5] flex items-center justify-between transition-colors group"
                                      >
                                        <div className="min-w-0 pr-2">
                                          <p className="text-xs font-bold text-[#0f2924] truncate">{rp.Full_Name}</p>
                                          <p className="text-[10px] text-[#4a7065] truncate">{rp.Expertise}</p>
                                        </div>
                                        <span className="shrink-0 text-[11px] text-[#a0bcb8] group-hover:text-[#0f7a6e] font-bold">Assign</span>
                                      </motion.button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Availability chips */}
                  {walkAvail.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#eef8f5] flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#4a7065] font-semibold">Responses:</span>
                      {walkAvail.map((a, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 20 }}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                            a.Is_Available === 'YES'
                              ? 'bg-[#d1faf5] text-[#0a3d2e] border-[#a7e6df]'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {a.Is_Available === 'YES' ? '✓' : '✗'} {a.Person_Name}
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ── Add Walk Modal ── */}
      <AnimatePresence>
        {showAddWalkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            className="fixed inset-0 bg-[#0f2924]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0, y: 20 }}
              animate={{ scale: 1,    opacity: 1, y: 0  }}
              exit={{   scale: 0.93, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-[#0f2924]">Plan a New Walk</h2>
                <button onClick={() => setShowAddWalkModal(false)} className="p-1.5 rounded-xl text-[#4a7065] hover:bg-[#eef8f5] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Walk Type</label>
                  <select value={newWalk.walkName} onChange={e => setNewWalk(p => ({ ...p, walkName: e.target.value }))} className={inputClass}>
                    <option>Nature & Biodiversity Walk</option>
                    <option>Muthai River Heritage Walk</option>
                    <option>Vitthalwadi River Walk</option>
                    <option>Aundh Ghat Walk</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Date <span className="text-rose-500 normal-case">*</span></label>
                    <input type="date" value={newWalk.date} onChange={e => setNewWalk(p => ({ ...p, date: e.target.value }))} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Time Slot</label>
                    <input type="text" placeholder="07:00 AM - 09:00 AM" value={newWalk.timeSlot} onChange={e => setNewWalk(p => ({ ...p, timeSlot: e.target.value }))} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Meeting Point</label>
                  <input type="text" placeholder="e.g. Vitthalwadi Temple Steps" value={newWalk.location} onChange={e => setNewWalk(p => ({ ...p, location: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Walk Topic / Theme</label>
                  <input type="text" placeholder="e.g. Riparian Flora, Native Birds" value={newWalk.topic} onChange={e => setNewWalk(p => ({ ...p, topic: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddWalkModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[#4a7065] bg-[#eef8f5] hover:bg-[#d1e9e5] transition-colors">
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleAddWalk}
                  disabled={isSaving}
                  className="btn-press flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-opacity disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0f7a6e 0%, #16a34a 100%)' }}
                >
                  <Plus className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Add to Schedule'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
