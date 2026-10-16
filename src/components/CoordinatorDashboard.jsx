import React, { useState } from 'react';
import {
  CalendarDays, AlertTriangle, Bell, User, Check, ChevronDown, MapPin, Clock,
  ExternalLink, Flag, MessageCircle, UserPlus, ShieldCheck, Trash2, Plus, X
} from 'lucide-react';
import { assignWalkLeader, updateFlyerStatus, approveNewVolunteer, dismissNewVolunteer, addNewWalk } from '../services/api';

// How many days until a walk — negative means it's in the past
function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const walkDate = new Date(dateStr);
  walkDate.setHours(0, 0, 0, 0);
  return Math.round((walkDate - today) / (1000 * 60 * 60 * 24));
}

function FlyerBadge({ status }) {
  const map = {
    Published: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Draft: 'bg-amber-50 text-amber-800 border-amber-300',
    Scheduled: 'bg-teal-50 text-teal-800 border-teal-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${map[status] || 'bg-slate-100 text-slate-600 border-slate-300'}`}>
      <Flag className="w-3 h-3" />
      Flyer: {status}
    </span>
  );
}

export default function CoordinatorDashboard({ walks, resourcePersons, availability, pendingVolunteers, onRefresh }) {
  const [openAssignId, setOpenAssignId] = useState(null);
  const [showAddWalkModal, setShowAddWalkModal] = useState(false);
  const [newWalk, setNewWalk] = useState({ walkName: 'Nature & Biodiversity Walk', date: '', timeSlot: '07:00 AM - 09:00 AM', location: '', topic: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Build availability map: { walkId: [{ name, phone, available }] }
  const availMap = {};
  availability.forEach(a => {
    if (!availMap[a.Walk_ID]) availMap[a.Walk_ID] = [];
    availMap[a.Walk_ID].push(a);
  });

  const upcomingWalks = walks
    .filter(w => daysUntil(w.Date) >= 0)
    .sort((a, b) => new Date(a.Date) - new Date(b.Date));

  // Alert: walks where flyer is NOT published and <=14 days away
  const flyerAlerts = upcomingWalks.filter(w => daysUntil(w.Date) <= 14 && w.Flyer_Status !== 'Published');
  const unassignedAlerts = upcomingWalks.filter(w => w.Assigned_Leader === 'UNASSIGNED' && daysUntil(w.Date) <= 30);

  const handleAssignLeader = async (walkId, leaderName) => {
    setIsSaving(true);
    await assignWalkLeader(walkId, leaderName);
    setOpenAssignId(null);
    showToast(`Leader assigned: ${leaderName}`);
    if (onRefresh) onRefresh();
    setIsSaving(false);
  };

  const getPersonDetails = (name) => {
    return resourcePersons.find(rp => (rp.Full_Name || '').toLowerCase() === (name || '').toLowerCase()) || {
      Full_Name: name,
      Expertise: 'Volunteer Guide',
      Phone: ''
    };
  };

  const handleFlyerToggle = async (walkId, currentStatus) => {
    const next = currentStatus === 'Published' ? 'Draft' : 'Published';
    await updateFlyerStatus(walkId, next);
    showToast(`Flyer marked as ${next}`);
    if (onRefresh) onRefresh();
  };

  const handleApprove = async (id, name) => {
    await approveNewVolunteer(id);
    showToast(`${name} approved & added to the guide pool!`);
    if (onRefresh) onRefresh();
  };

  const handleDismiss = async (id, name) => {
    await dismissNewVolunteer(id);
    showToast(`${name} application dismissed.`, 'neutral');
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

      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
        }`}>
          <Check className="w-4 h-4" /> {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Walk Command Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage annual schedule, assign leaders, and track flyer releases.</p>
        </div>
        <button
          onClick={() => setShowAddWalkModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-sm font-bold shadow-md shadow-emerald-700/20 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Plan New Walk
        </button>
      </div>

      {/* ── URGENT ACTION RIBBON ── */}
      {(flyerAlerts.length > 0 || unassignedAlerts.length > 0) && (
        <section className="mb-6 space-y-3">
          {flyerAlerts.map(w => {
            const days = daysUntil(w.Date);
            return (
              <div key={`flyer-${w.Walk_ID}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-300 shadow-xs">
                <div className="flex items-center gap-2 text-amber-800 shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="font-bold text-sm">{days === 0 ? 'TODAY' : `${days} Day${days !== 1 ? 's' : ''} Left`}</span>
                </div>
                <p className="text-sm text-amber-900 font-medium flex-1">
                  <strong>{w.Walk_Name}</strong> on <strong>{w.Date}</strong> — Flyer is still <em>{w.Flyer_Status}</em>. Post it to Instagram & WhatsApp now!
                </p>
                <button
                  onClick={() => handleFlyerToggle(w.Walk_ID, w.Flyer_Status)}
                  className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                >
                  Mark Flyer Published ✓
                </button>
              </div>
            );
          })}

          {unassignedAlerts.map(w => (
            <div key={`assign-${w.Walk_ID}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-300 shadow-xs">
              <div className="flex items-center gap-2 text-rose-800 shrink-0">
                <Bell className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="font-bold text-sm">{daysUntil(w.Date)}d</span>
              </div>
              <p className="text-sm text-rose-900 font-medium flex-1">
                <strong>{w.Walk_Name}</strong> on <strong>{w.Date}</strong> — No resource person assigned yet!
              </p>
              <button
                onClick={() => setOpenAssignId(w.Walk_ID)}
                className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
              >
                Assign Leader →
              </button>
            </div>
          ))}
        </section>
      )}

      {/* ── PENDING NEW VOLUNTEER QUEUE ── */}
      {pendingVolunteers && pendingVolunteers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            New Volunteer Applications
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold">{pendingVolunteers.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingVolunteers.map(v => (
              <div key={v.id} className="bg-white rounded-xl border border-indigo-200 shadow-xs p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-bold text-slate-900">{v.name}</p>
                    <p className="text-xs text-indigo-700 font-medium">{v.expertise}</p>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold shrink-0">
                    New
                  </span>
                </div>
                <div className="space-y-1 mb-4 text-xs text-slate-600">
                  <p>📞 {v.phone} {v.email && `• 📧 ${v.email}`}</p>
                  <p>🌿 Applied for: <span className="font-medium text-slate-900">{v.walkName}</span></p>
                  <p className="text-slate-400">Submitted: {v.submittedAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${v.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${v.name}, thanks for registering as a Jeevitnadi walk volunteer! We've seen your interest in the ${v.walkName}. Can we connect for a quick 5-minute chat?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                  <button
                    onClick={() => handleApprove(v.id, v.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Approve to Pool
                  </button>
                  <button
                    onClick={() => handleDismiss(v.id, v.name)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── WALKS SCHEDULE ── */}
      <section>
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-teal-600" />
          Upcoming Walks
          <span className="text-xs font-normal text-slate-500 ml-1">({upcomingWalks.length} scheduled)</span>
        </h2>

        <div className="space-y-4">
          {upcomingWalks.map(walk => {
            const days = daysUntil(walk.Date);
            const isNear = days <= 14;
            const isUnassigned = walk.Assigned_Leader === 'UNASSIGNED';
            const walkAvail = availMap[walk.Walk_ID] || [];

            // Deduplicate by person name and separate Available vs Busy
            const seenNames = new Set();
            const availableGuides = [];
            const busyGuides = [];

            walkAvail.forEach(a => {
              const trimmed = (a.Person_Name || '').trim();
              if (!trimmed || seenNames.has(trimmed.toLowerCase())) return;
              seenNames.add(trimmed.toLowerCase());
              if (a.Is_Available === 'YES') {
                availableGuides.push(a);
              } else {
                busyGuides.push(a);
              }
            });

            const otherResourcePersons = resourcePersons.filter(
              rp => rp.Status === 'Active' && !seenNames.has((rp.Full_Name || '').trim().toLowerCase())
            );

            const isOpen = openAssignId === walk.Walk_ID;

            const statusColor = {
              Confirmed: 'border-emerald-300 bg-emerald-50/50',
              Scheduled: 'border-slate-200 bg-white',
              'Action Required': 'border-rose-300 bg-rose-50/40',
              Planned: 'border-slate-200 bg-white',
            }[walk.Status] || 'border-slate-200 bg-white';

            return (
              <div key={walk.Walk_ID} className={`rounded-2xl border ${statusColor} shadow-xs overflow-visible transition-all relative`}>
                {/* Walk Header Row */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    {/* Left Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-base">{walk.Walk_Name}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                          days === 0 ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          days <= 7 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {days === 0 ? 'TODAY' : `${days}d away`} · {walk.Date}
                        </span>
                        <FlyerBadge status={walk.Flyer_Status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {walk.Time_Slot}</div>
                        <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {walk.Location}</div>
                        <div className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" />
                          {isUnassigned
                            ? <span className="text-rose-600 font-semibold">Leader: UNASSIGNED</span>
                            : <span className="text-emerald-700 font-semibold">{walk.Assigned_Leader}</span>
                          }
                        </div>
                      </div>

                      <p className="text-xs text-emerald-900 font-medium">🌱 {walk.Topic}</p>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Mark Flyer Button */}
                      <button
                        onClick={() => handleFlyerToggle(walk.Walk_ID, walk.Flyer_Status)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                          walk.Flyer_Status === 'Published'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800'
                        }`}
                      >
                        <Flag className="w-3 h-3" />
                        {walk.Flyer_Status === 'Published' ? 'Flyer ✓' : 'Mark Flyer Sent'}
                      </button>

                      {/* Registration Link */}
                      {walk.Registration_Link && (
                        <a
                          href={walk.Registration_Link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Reg. Link
                        </a>
                      )}

                      {/* Assign Leader Dropdown Trigger */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenAssignId(isOpen ? null : walk.Walk_ID)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                            isUnassigned
                              ? 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                          }`}
                        >
                          <User className="w-3 h-3" />
                          {isUnassigned ? 'Assign Leader' : 'Reassign'}
                          {availableGuides.length > 0 && (
                            <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
                              {availableGuides.length}
                            </span>
                          )}
                          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Panel */}
                        {isOpen && (
                          <div className="absolute right-0 top-full mt-2 z-40 bg-white rounded-2xl border border-slate-200 shadow-2xl w-80 sm:w-96 p-4 max-h-[28rem] overflow-y-auto">
                            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                              <div>
                                <p className="text-xs font-bold text-slate-800">Assign / Reassign Walk Leader</p>
                                <p className="text-[11px] text-slate-500">Pick from all guides who responded Free</p>
                              </div>
                              <button
                                onClick={() => setOpenAssignId(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Section 1: Available Guides (said YES) */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                  Available Guides (Marked Free)
                                </span>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  {availableGuides.length} available
                                </span>
                              </div>

                              {availableGuides.length > 0 ? (
                                <div className="space-y-1.5">
                                  {availableGuides.map(avail => {
                                    const details = getPersonDetails(avail.Person_Name);
                                    const isCurrent = walk.Assigned_Leader === avail.Person_Name;
                                    return (
                                      <div
                                        key={avail.Person_Name}
                                        className={`p-2.5 rounded-xl border transition-all ${
                                          isCurrent
                                            ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400'
                                            : 'bg-emerald-50/30 border-emerald-200/80 hover:bg-emerald-50 hover:border-emerald-300'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                                              {avail.Person_Name}
                                              {isCurrent && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                                                  Assigned
                                                </span>
                                              )}
                                            </p>
                                            <p className="text-[11px] text-emerald-800/90 font-medium truncate mt-0.5">
                                              {details.Expertise}
                                            </p>
                                            {(details.Phone || avail.Phone) && (
                                              <p className="text-[10px] text-slate-400 mt-0.5">
                                                📞 {details.Phone || avail.Phone}
                                              </p>
                                            )}
                                          </div>
                                          {!isCurrent ? (
                                            <button
                                              onClick={() => handleAssignLeader(walk.Walk_ID, avail.Person_Name)}
                                              disabled={isSaving}
                                              className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
                                            >
                                              Assign →
                                            </button>
                                          ) : (
                                            <span className="shrink-0 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200 text-center">
                                  No guides have marked themselves available yet.
                                </p>
                              )}
                            </div>

                            {/* Section 2: Busy Guides (said NO) */}
                            {busyGuides.length > 0 && (
                              <div className="mb-4 pt-3 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold text-slate-500">
                                    Marked Busy / Unavailable
                                  </span>
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                    {busyGuides.length}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  {busyGuides.map(bg => (
                                    <div key={bg.Person_Name} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 text-xs text-slate-500">
                                      <span className="font-medium">{bg.Person_Name}</span>
                                      <span className="text-[10px] text-rose-500 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                        Busy
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Section 3: All other resource persons */}
                            {otherResourcePersons.length > 0 && (
                              <div className="pt-3 border-t border-slate-100">
                                <p className="text-xs font-bold text-slate-600 mb-2">
                                  Other Registered Resource Persons ({otherResourcePersons.length}):
                                </p>
                                <div className="space-y-1">
                                  {otherResourcePersons.map(rp => (
                                    <button
                                      key={rp.Person_ID}
                                      onClick={() => handleAssignLeader(walk.Walk_ID, rp.Full_Name)}
                                      disabled={isSaving}
                                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between transition-colors group"
                                    >
                                      <div className="min-w-0 pr-2">
                                        <p className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 truncate">{rp.Full_Name}</p>
                                        <p className="text-[10px] text-slate-400 truncate">{rp.Expertise}</p>
                                      </div>
                                      <span className="shrink-0 text-[11px] text-slate-400 group-hover:text-emerald-700 font-medium">Assign</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Availability Chips (bottom bar) */}
                  {walkAvail.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Responses:</span>
                      {walkAvail.map((a, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            a.Is_Available === 'YES'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {a.Is_Available === 'YES' ? '✓' : '✗'} {a.Person_Name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ADD WALK MODAL ── */}
      {showAddWalkModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Plan a New Walk</h2>
              <button onClick={() => setShowAddWalkModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Walk Type</label>
                <select
                  value={newWalk.walkName}
                  onChange={e => setNewWalk(p => ({ ...p, walkName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option>Nature & Biodiversity Walk</option>
                  <option>Muthai River Heritage Walk</option>
                  <option>Vitthalwadi River Walk</option>
                  <option>Aundh Ghat Walk</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={newWalk.date}
                    onChange={e => setNewWalk(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Time Slot</label>
                  <input
                    type="text"
                    placeholder="07:00 AM - 09:00 AM"
                    value={newWalk.timeSlot}
                    onChange={e => setNewWalk(p => ({ ...p, timeSlot: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Meeting Point / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Vitthalwadi Temple Steps"
                  value={newWalk.location}
                  onChange={e => setNewWalk(p => ({ ...p, location: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Walk Topic / Theme</label>
                <input
                  type="text"
                  placeholder="e.g. Riparian Flora, Native Birds, Sewage Monitoring"
                  value={newWalk.topic}
                  onChange={e => setNewWalk(p => ({ ...p, topic: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddWalkModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddWalk}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Add to Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
