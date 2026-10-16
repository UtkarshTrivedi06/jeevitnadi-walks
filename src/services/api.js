/**
 * Jeevitnadi Walk Management API Service
 * Supports both Live Google Apps Script Web App endpoints and offline localStorage Mock mode.
 */

const STORAGE_KEY = 'jeevitnadi_walks_data_v2';
const API_URL_KEY = 'jeevitnadi_apps_script_url';

export const DEFAULT_DATA = {
  walks: [
    {
      Walk_ID: 'WK-101',
      Walk_Name: 'Nature & Biodiversity Walk',
      Date: '2026-10-30', // Exactly 14 days from Oct 16, 2026 (triggers 14-day alert!)
      Time_Slot: '06:45 AM - 08:45 AM',
      Location: 'Vaikunth Riverbed Trail',
      Topic: 'Riparian Flora, Spiders & Native Bird Species',
      Assigned_Leader: 'Dr. Sunita Rao',
      Flyer_Status: 'Draft',
      Flyer_Link: 'https://drive.google.com/drive/folders/sample-flyer-101',
      Registration_Link: 'https://forms.gle/nature-walk-oct30',
      Status: 'Scheduled'
    },
    {
      Walk_ID: 'WK-102',
      Walk_Name: 'Muthai River Heritage Walk',
      Date: '2026-11-08',
      Time_Slot: '07:00 AM - 09:30 AM',
      Location: 'Sangam Ghat (Near COEP Boat Club)',
      Topic: 'River Confluence, Historic Weirs & Sewage Remediation',
      Assigned_Leader: 'UNASSIGNED',
      Flyer_Status: 'Draft',
      Flyer_Link: '',
      Registration_Link: 'https://forms.gle/muthai-walk-nov08',
      Status: 'Action Required'
    },
    {
      Walk_ID: 'WK-103',
      Walk_Name: 'Vitthalwadi River Walk',
      Date: '2026-11-15',
      Time_Slot: '07:00 AM - 09:00 AM',
      Location: 'Vitthalwadi Temple Steps',
      Topic: 'Ecological Restoration & Riverbed Bio-shields',
      Assigned_Leader: 'Dr. Kulkarni',
      Flyer_Status: 'Published',
      Flyer_Link: 'https://drive.google.com/drive/folders/sample-flyer-103',
      Registration_Link: 'https://forms.gle/vitthalwadi-walk-nov15',
      Status: 'Confirmed'
    },
    {
      Walk_ID: 'WK-104',
      Walk_Name: 'Aundh Ghat Walk',
      Date: '2026-11-22',
      Time_Slot: '07:00 AM - 09:00 AM',
      Location: 'Rajiv Gandhi Bridge / Aundh Ghat',
      Topic: 'Urban Riverfront Encroachment & Water Quality Tally',
      Assigned_Leader: 'Aditi Sharma',
      Flyer_Status: 'Draft',
      Flyer_Link: '',
      Registration_Link: 'https://forms.gle/aundh-walk-nov22',
      Status: 'Scheduled'
    },
    {
      Walk_ID: 'WK-105',
      Walk_Name: 'Vitthalwadi River Walk',
      Date: '2026-12-06',
      Time_Slot: '07:00 AM - 09:00 AM',
      Location: 'Vitthalwadi Temple Steps',
      Topic: 'Community Riparian Planting & Clean River Survey',
      Assigned_Leader: 'UNASSIGNED',
      Flyer_Status: 'Draft',
      Flyer_Link: '',
      Registration_Link: '',
      Status: 'Planned'
    }
  ],
  resourcePersons: [
    {
      Person_ID: 'RP-001',
      Full_Name: 'Dr. Kulkarni',
      Phone: '9822012345',
      Email: 'kulkarni@jeevitnadi.org',
      Expertise: 'Hydrologist / River Basin Restoration',
      Status: 'Active'
    },
    {
      Person_ID: 'RP-002',
      Full_Name: 'Dr. Sunita Rao',
      Phone: '9890123456',
      Email: 'sunita.rao@jeevitnadi.org',
      Expertise: 'Botanist & Riparian Flora Specialist',
      Status: 'Active'
    },
    {
      Person_ID: 'RP-003',
      Full_Name: 'Aditi Sharma',
      Phone: '9765432109',
      Email: 'aditi@jeevitnadi.org',
      Expertise: 'Ornithologist & River Ecosystem Lead',
      Status: 'Active'
    },
    {
      Person_ID: 'RP-004',
      Full_Name: 'Rohan Deshmukh',
      Phone: '9422334455',
      Email: 'rohan@jeevitnadi.org',
      Expertise: 'River Conservationist & Youth Organizer',
      Status: 'Active'
    },
    {
      Person_ID: 'RP-005',
      Full_Name: 'Rahul Verma',
      Phone: '+91 98811 22334',
      Email: 'rahul.verma@gmail.com',
      Expertise: 'Wildlife Photography & Bio-tally',
      Status: 'Active'
    },
    {
      Person_ID: 'RP-006',
      Full_Name: 'Pooja Kadam',
      Phone: '+91 97660 88990',
      Email: 'pooja.kadam@gmail.com',
      Expertise: 'Environmental Coordinator & Public Liaison',
      Status: 'Active'
    }
  ],
  availability: [
    // Walk 101 - Nature & Biodiversity Walk (multiple available)
    { Response_ID: 'RES-01', Walk_ID: 'WK-101', Person_Name: 'Dr. Sunita Rao', Phone: '9890123456', Is_Available: 'YES' },
    { Response_ID: 'RES-02', Walk_ID: 'WK-101', Person_Name: 'Aditi Sharma', Phone: '9765432109', Is_Available: 'YES' },
    { Response_ID: 'RES-03', Walk_ID: 'WK-101', Person_Name: 'Rohan Deshmukh', Phone: '9422334455', Is_Available: 'YES' },
    { Response_ID: 'RES-04', Walk_ID: 'WK-101', Person_Name: 'Rahul Verma', Phone: '+91 98811 22334', Is_Available: 'YES' },

    // Walk 102 - Muthai River Heritage Walk (multiple available)
    { Response_ID: 'RES-05', Walk_ID: 'WK-102', Person_Name: 'Rohan Deshmukh', Phone: '9422334455', Is_Available: 'YES' },
    { Response_ID: 'RES-06', Walk_ID: 'WK-102', Person_Name: 'Dr. Sunita Rao', Phone: '9890123456', Is_Available: 'YES' },
    { Response_ID: 'RES-07', Walk_ID: 'WK-102', Person_Name: 'Pooja Kadam', Phone: '+91 97660 88990', Is_Available: 'YES' },
    { Response_ID: 'RES-08', Walk_ID: 'WK-102', Person_Name: 'Dr. Kulkarni', Phone: '9822012345', Is_Available: 'NO' },

    // Walk 103 - Vitthalwadi River Walk (multiple available)
    { Response_ID: 'RES-09', Walk_ID: 'WK-103', Person_Name: 'Dr. Kulkarni', Phone: '9822012345', Is_Available: 'YES' },
    { Response_ID: 'RES-10', Walk_ID: 'WK-103', Person_Name: 'Aditi Sharma', Phone: '9765432109', Is_Available: 'YES' },
    { Response_ID: 'RES-11', Walk_ID: 'WK-103', Person_Name: 'Rohan Deshmukh', Phone: '9422334455', Is_Available: 'YES' },

    // Walk 104 - Aundh Ghat Walk (multiple available)
    { Response_ID: 'RES-12', Walk_ID: 'WK-104', Person_Name: 'Aditi Sharma', Phone: '9765432109', Is_Available: 'YES' },
    { Response_ID: 'RES-13', Walk_ID: 'WK-104', Person_Name: 'Dr. Sunita Rao', Phone: '9890123456', Is_Available: 'YES' },
    { Response_ID: 'RES-14', Walk_ID: 'WK-104', Person_Name: 'Dr. Kulkarni', Phone: '9822012345', Is_Available: 'YES' },

    // Walk 105 - Vitthalwadi River Walk (multiple available)
    { Response_ID: 'RES-15', Walk_ID: 'WK-105', Person_Name: 'Rohan Deshmukh', Phone: '9422334455', Is_Available: 'YES' },
    { Response_ID: 'RES-16', Walk_ID: 'WK-105', Person_Name: 'Dr. Kulkarni', Phone: '9822012345', Is_Available: 'YES' },
    { Response_ID: 'RES-17', Walk_ID: 'WK-105', Person_Name: 'Aditi Sharma', Phone: '9765432109', Is_Available: 'NO' }
  ],
  pendingVolunteers: [
    {
      id: 'PV-001',
      name: 'Ananya Deshpande',
      phone: '+91 98224 55667',
      email: 'ananya.deshpande@gmail.com',
      expertise: 'Geologist & Groundwater specialist',
      walkId: 'WK-102',
      walkName: 'Muthai River Heritage Walk',
      submittedAt: '2026-10-16 08:30'
    }
  ]
};

// Helper to get or set local data
export const getLocalStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      return DEFAULT_DATA;
    }
    const parsed = JSON.parse(raw);
    // If availability is sparse, reload with default rich data
    if (!parsed.availability || parsed.availability.length < 8) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      return DEFAULT_DATA;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_DATA;
  }
};

export const saveLocalStore = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

const DEFAULT_LIVE_API_URL = 'https://script.google.com/macros/s/AKfycbxczsZQRHGSi0f1POtd8hTD0G-5c5-leyj-SEN-eQL7wgjChEVCUEqxgoeg9P90j6eH/exec';

export const getApiUrl = () => {
  return localStorage.getItem(API_URL_KEY) || import.meta.env.VITE_APPS_SCRIPT_URL || DEFAULT_LIVE_API_URL;
};

export const setApiUrl = (url) => {
  localStorage.setItem(API_URL_KEY, url);
};

// Fetch all data
export async function fetchAllData() {
  const apiUrl = getApiUrl();
  if (apiUrl && apiUrl.startsWith('http')) {
    try {
      const res = await fetch(apiUrl);
      const json = await res.json();
      if (json.status === 'success') {
        return json;
      }
    } catch (err) {
      console.warn('API fetch failed, falling back to local state:', err);
    }
  }
  return getLocalStore();
}

// Submit volunteer availability (tick or cross)
export async function submitAvailability({ walkId, personName, phone, isAvailable, isNewVolunteer, expertise, email }) {
  const apiUrl = getApiUrl();
  const current = getLocalStore();

  // Update local state immediately (optimistic UI)
  const normName = (personName || '').trim().toLowerCase();
  const normPhone = (phone || '').replace(/\D/g, '');

  const existingIdx = current.availability.findIndex(a => {
    if (a.Walk_ID !== walkId) return false;
    const aNormName = (a.Person_Name || '').trim().toLowerCase();
    const aNormPhone = (a.Phone || '').replace(/\D/g, '');
    if (aNormName && normName && aNormName === normName) return true;
    if (normPhone && normPhone.length >= 10 && aNormPhone && aNormPhone.length >= 10 && aNormPhone === normPhone) return true;
    return false;
  });

  if (existingIdx >= 0) {
    current.availability[existingIdx].Is_Available = isAvailable ? 'YES' : 'NO';
  } else {
    current.availability.push({
      Response_ID: 'RES-' + Math.random().toString(36).substring(2, 7),
      Walk_ID: walkId,
      Person_Name: personName,
      Phone: phone,
      Is_Available: isAvailable ? 'YES' : 'NO'
    });
  }

  // If new volunteer, add to pending list
  if (isNewVolunteer) {
    const walk = current.walks.find(w => w.Walk_ID === walkId);
    current.pendingVolunteers.unshift({
      id: 'PV-' + Date.now().toString(36),
      name: personName,
      phone: phone,
      email: email || '',
      expertise: expertise || 'Volunteer Guide',
      walkId: walkId,
      walkName: walk ? walk.Walk_Name : 'Upcoming Walk',
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    });
  }

  saveLocalStore(current);

  // If live API is connected, push in background
  if (apiUrl && apiUrl.startsWith('http')) {
    try {
      fetch(apiUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUBMIT_AVAILABILITY',
          walkId,
          personName,
          phone,
          isAvailable,
          isNewVolunteer,
          expertise,
          email
        })
      });
    } catch (e) {
      console.error('API POST failed', e);
    }
  }

  return { success: true };
}

// Coordinator assigns leader
export async function assignWalkLeader(walkId, leaderName) {
  const current = getLocalStore();
  const walk = current.walks.find(w => w.Walk_ID === walkId);
  if (walk) {
    walk.Assigned_Leader = leaderName;
    if (walk.Status === 'Action Required' && leaderName !== 'UNASSIGNED') {
      walk.Status = 'Scheduled';
    }
    saveLocalStore(current);
  }

  const apiUrl = getApiUrl();
  if (apiUrl && apiUrl.startsWith('http')) {
    fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ASSIGN_LEADER',
        walkId,
        assignedLeader: leaderName
      })
    }).catch(console.error);
  }

  return { success: true };
}

// Coordinator updates flyer status
export async function updateFlyerStatus(walkId, status) {
  const current = getLocalStore();
  const walk = current.walks.find(w => w.Walk_ID === walkId);
  if (walk) {
    walk.Flyer_Status = status;
    saveLocalStore(current);
  }

  const apiUrl = getApiUrl();
  if (apiUrl && apiUrl.startsWith('http')) {
    fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE_FLYER_STATUS',
        walkId,
        flyerStatus: status
      })
    }).catch(console.error);
  }

  return { success: true };
}

// Coordinator approves new volunteer into official pool
export async function approveNewVolunteer(volunteerId) {
  const current = getLocalStore();
  const vIdx = current.pendingVolunteers.findIndex(v => v.id === volunteerId);
  if (vIdx >= 0) {
    const v = current.pendingVolunteers[vIdx];
    const exists = current.resourcePersons.some(
      rp => (rp.Full_Name || '').trim().toLowerCase() === (v.name || '').trim().toLowerCase()
    );
    if (!exists) {
      current.resourcePersons.push({
        Person_ID: 'RP-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        Full_Name: v.name,
        Phone: v.phone,
        Email: v.email,
        Expertise: v.expertise,
        Status: 'Active'
      });
    }
    // Also record their availability as YES for the walk they applied for
    if (v.walkId) {
      const availIdx = current.availability.findIndex(
        a => a.Walk_ID === v.walkId && (a.Person_Name || '').trim().toLowerCase() === (v.name || '').trim().toLowerCase()
      );
      if (availIdx >= 0) {
        current.availability[availIdx].Is_Available = 'YES';
      } else {
        current.availability.push({
          Response_ID: 'RES-' + Math.random().toString(36).substring(2, 7),
          Walk_ID: v.walkId,
          Person_Name: v.name,
          Phone: v.phone,
          Is_Available: 'YES'
        });
      }
    }
    current.pendingVolunteers.splice(vIdx, 1);
    saveLocalStore(current);
  }
}

// Coordinator dismisses new volunteer application
export async function dismissNewVolunteer(volunteerId) {
  const current = getLocalStore();
  current.pendingVolunteers = current.pendingVolunteers.filter(v => v.id !== volunteerId);
  saveLocalStore(current);
  return { success: true };
}

// Coordinator adds new walk
export async function addNewWalk(walkData) {
  const current = getLocalStore();
  const newWalk = {
    Walk_ID: 'WK-' + (current.walks.length + 101),
    Walk_Name: walkData.walkName,
    Date: walkData.date,
    Time_Slot: walkData.timeSlot || '07:00 AM - 09:00 AM',
    Location: walkData.location || 'Pune River Ghat',
    Topic: walkData.topic || 'River Ecology & Conservation',
    Assigned_Leader: 'UNASSIGNED',
    Flyer_Status: 'Draft',
    Flyer_Link: '',
    Registration_Link: '',
    Status: 'Action Required'
  };
  current.walks.push(newWalk);
  // Sort walks by date
  current.walks.sort((a, b) => new Date(a.Date) - new Date(b.Date));
  saveLocalStore(current);
  return { success: true, walk: newWalk };
}
