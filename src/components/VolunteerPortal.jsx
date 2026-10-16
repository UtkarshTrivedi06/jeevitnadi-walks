import React, { useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, UserCheck, Sparkles, Send, Check } from 'lucide-react';
import { submitAvailability } from '../services/api';

export default function VolunteerPortal({ walks, resourcePersons, availability, onRefresh }) {
  const [volunteerType, setVolunteerType] = useState('existing'); // 'existing' | 'new'
  const [selectedPerson, setSelectedPerson] = useState(resourcePersons[0]?.Full_Name || '');
  const [phoneDigits, setPhoneDigits] = useState('');
  
  // New volunteer form fields
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newExpertise, setNewExpertise] = useState('Bird Watching & Biodiversity');

  // Track user selections per walk: { [walkId]: true | false }
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(null);

  // Set response for a walk
  const handleToggle = (walkId, isFree) => {
    setResponses(prev => ({
      ...prev,
      [walkId]: isFree
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const effectiveName = volunteerType === 'existing' ? selectedPerson : newName.trim();
    const effectivePhone = volunteerType === 'existing' ? phoneDigits : newPhone.trim();

    if (!effectiveName) {
      alert('Please select or enter your name.');
      return;
    }

    if (volunteerType === 'new' && (!effectivePhone || effectivePhone.length < 10)) {
      alert('Please enter a valid 10-digit WhatsApp/Phone number.');
      return;
    }

    const answeredWalkIds = Object.keys(responses);
    if (answeredWalkIds.length === 0) {
      alert('Please mark at least one walk as Free or Busy.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit each answered walk
      for (const walkId of answeredWalkIds) {
        await submitAvailability({
          walkId,
          personName: effectiveName,
          phone: effectivePhone,
          isAvailable: responses[walkId],
          isNewVolunteer: volunteerType === 'new',
          expertise: volunteerType === 'new' ? newExpertise : '',
          email: volunteerType === 'new' ? newEmail : ''
        });
      }

      setSubmittedMessage(`Thank you, ${effectiveName}! Your walk availability has been logged successfully.`);
      if (onRefresh) onRefresh();
      
      // Auto clear message after 5 seconds
      setTimeout(() => {
        setSubmittedMessage(null);
      }, 6000);
    } catch (err) {
      alert('Failed to save availability. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Hero Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Volunteer & Guide Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mark Your Availability for Upcoming Walks
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Help Jeevitnadi lock in expert guides and release publicity flyers 2 weeks in advance. Tap your availability below.
        </p>
      </div>

      {/* Success Notification */}
      {submittedMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 animate-fade-in shadow-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">{submittedMessage}</p>
            <p className="text-xs text-emerald-700">Shubha and the coordination team will review your schedule shortly.</p>
          </div>
        </div>
      )}

      {/* Step 1: Who Are You? Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-600" /> Step 1: Who is filling this?
        </h2>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setVolunteerType('existing')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              volunteerType === 'existing'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🌿 Existing Guide / Resource Person
          </button>
          <button
            type="button"
            onClick={() => setVolunteerType('new')}
            className={`py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              volunteerType === 'new'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ✨ I am a New Volunteer
          </button>
        </div>

        {/* Existing Volunteer Form */}
        {volunteerType === 'existing' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Your Name from Guide Pool
              </label>
              <select
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {resourcePersons.map((rp) => (
                  <option key={rp.Person_ID} value={rp.Full_Name}>
                    {rp.Full_Name} ({rp.Expertise || 'Guide'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Last 4 Digits of Phone (Identity confirmation)
              </label>
              <input
                type="text"
                placeholder="e.g. 2345"
                maxLength={4}
                value={phoneDigits}
                onChange={(e) => setPhoneDigits(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          /* New Volunteer Registration Form */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Verma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  WhatsApp Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98811 22334"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Area of Interest / Background
                </label>
                <select
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Bird Watching & Biodiversity">Bird Watching & Biodiversity</option>
                  <option value="Botany & Riparian Native Flora">Botany & Riparian Native Flora</option>
                  <option value="River Hydrology & Cleanups">River Hydrology & Cleanups</option>
                  <option value="Heritage Ghat History & Architecture">Heritage Ghat History & Architecture</option>
                  <option value="General Walk Coordinator / Crowd Management">General Walk Coordinator</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">
              * Note: New volunteers will be reviewed and contacted on WhatsApp by Shubha before assignment as co-leads.
            </p>
          </div>
        )}
      </div>

      {/* Step 2: Upcoming Walks Schedule Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" /> Step 2: Mark Your Availability
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {walks.length} upcoming walks scheduled
          </span>
        </div>

        <div className="space-y-4">
          {walks.map((walk) => {
            const isFree = responses[walk.Walk_ID];
            const isAssigned = walk.Assigned_Leader !== 'UNASSIGNED';

            return (
              <div
                key={walk.Walk_ID}
                className={`bg-white rounded-xl border transition-all p-5 shadow-xs ${
                  isFree === true
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                    : isFree === false
                    ? 'border-slate-300 opacity-70 bg-slate-50/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left: Walk Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{walk.Walk_Name}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                        {walk.Date}
                      </span>
                      {isAssigned && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Lead: {walk.Assigned_Leader}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{walk.Time_Slot}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{walk.Location}</span>
                      </div>
                    </div>

                    <p className="text-xs text-emerald-800 font-medium pt-0.5">
                      🌱 Focus: {walk.Topic}
                    </p>
                  </div>

                  {/* Right: Quick [✓ Free] & [✗ Busy] Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(walk.Walk_ID, true)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                        isFree === true
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-600'
                          : 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I'm Free</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggle(walk.Walk_ID, false)}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isFree === false
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Busy</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Submission Bar */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4">
        <div className="text-xs text-slate-600">
          <span className="font-bold text-slate-900">{Object.keys(responses).length}</span> of {walks.length} walks selected
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-sm font-bold shadow-md shadow-emerald-700/20 hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : 'Submit My Availability'}</span>
        </button>
      </div>

    </div>
  );
}
