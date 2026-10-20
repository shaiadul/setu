import {
  BloodDrive,
  BloodGroup,
  BloodRequest,
  DonorProfile,
  JuDonor,
  JuRole,
  ResponderStatus,
} from '@/types/blood';

const MOCK_REQUESTS: BloodRequest[] = [
  {
    id: 'req-ju-1',
    patientName: 'Tahsin Ahmed (CSE 49th)',
    hospital: 'Jahangirnagar University Medical Centre',
    campusArea: 'Medical Center Quad',
    room: 'Emergency Observation Ward, Bed 3',
    distance: '0.2 km (3 min walk)',
    requiredUnits: 2,
    bloodType: 'O-',
    urgency: 'Code Red',
    caseType: 'Trauma / Accident',
    description: 'Road accident near Dairy Gate. Immediate O- transfusion required before shifting to Enam Hospital.',
    timeAgo: '5 mins ago',
    respondersCount: 2,
    userStatus: 'none',
    contactNumber: '01712-345678',
    requesterRole: 'student',
    requesterDepartment: 'Computer Science & Engineering',
    requesterHallOrOffice: 'Al-Beruni Hall',
    createdAt: new Date().toISOString(),
    activeResponders: [
      {
        id: 'resp-1',
        name: 'Dr. Rafiqul Islam',
        role: 'teacher',
        departmentOrOffice: 'Pharmacy Dept',
        phone: '01819-223344',
        status: 'en_route',
        eta: '7 mins',
        updatedAt: 'Just now',
      },
      {
        id: 'resp-2',
        name: 'Tanvir Hossain',
        role: 'student',
        departmentOrOffice: 'Physics (48th)',
        phone: '01711-998877',
        status: 'arrived',
        eta: 'Arrived at Ward',
        updatedAt: '2 mins ago',
      },
    ],
  },
  {
    id: 'req-ju-2',
    patientName: 'Prof. Anisur Rahman',
    hospital: 'Enam Medical College & Hospital',
    campusArea: 'Savar (Opposite Thana Stand)',
    room: 'ICU-3, Bed 12',
    distance: '3.5 km (10 min ride)',
    requiredUnits: 3,
    bloodType: 'A+',
    urgency: 'Code Red',
    caseType: 'Emergency Surgery',
    description: 'Open bypass heart surgery scheduled. 3 fresh units needed by 11:30 AM.',
    timeAgo: '20 mins ago',
    respondersCount: 3,
    userStatus: 'none',
    contactNumber: '01914-556677',
    requesterRole: 'teacher',
    requesterDepartment: 'Economics',
    requesterHallOrOffice: 'Teacher Quarter #14',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    activeResponders: [
      {
        id: 'resp-3',
        name: 'Mahbub Alam',
        role: 'staff',
        departmentOrOffice: 'Registrar Building',
        phone: '01678-112233',
        status: 'en_route',
        eta: '12 mins',
        updatedAt: '5 mins ago',
      },
    ],
  },
  {
    id: 'req-ju-3',
    patientName: 'Suraiya Yasmin (M.Phil Scholar)',
    hospital: 'Savar Upazila Health Complex',
    campusArea: 'Genda Bus Stand',
    room: 'Maternity Ward 2, Bed 8',
    distance: '4.2 km (15 min ride)',
    requiredUnits: 1,
    bloodType: 'B+',
    urgency: 'Urgent',
    caseType: 'Maternity',
    description: 'Urgent replacement transfusion post C-section delivery.',
    timeAgo: '45 mins ago',
    respondersCount: 1,
    userStatus: 'none',
    contactNumber: '01552-887766',
    requesterRole: 'student',
    requesterDepartment: 'Biochemistry & Molecular Biology',
    requesterHallOrOffice: 'Pritilata Hall',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    activeResponders: [],
  },
  {
    id: 'req-ju-4',
    patientName: 'Abdul Mannan (Senior Assistant)',
    hospital: 'Jahangirnagar University Medical Centre',
    campusArea: 'Medical Center',
    room: 'Pathology & Infusion Bed 1',
    distance: '0.1 km (2 min walk)',
    requiredUnits: 2,
    bloodType: 'AB+',
    urgency: 'Standard',
    caseType: 'Thalassemia',
    description: 'Routine scheduled monthly blood transfusion for staff dependent child.',
    timeAgo: '2 hours ago',
    respondersCount: 1,
    userStatus: 'none',
    contactNumber: '01720-445566',
    requesterRole: 'staff',
    requesterDepartment: 'Central Library',
    requesterHallOrOffice: 'Staff Quarters',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    activeResponders: [],
  },
];

const MOCK_DONORS: JuDonor[] = [
  {
    id: 'donor-1',
    name: 'Saidul Bashar',
    role: 'student',
    bloodType: 'O-',
    departmentOrOffice: 'Computer Science & Engineering (48th)',
    hallOrResidence: 'Al-Beruni Hall',
    studentOrStaffId: 'JU-2019-CSE-042',
    phone: '01700-112233',
    isAvailable: true,
    totalDonations: 6,
    lastDonationDate: '12 Aug 2026',
    verifiedJu: true,
  },
  {
    id: 'donor-2',
    name: 'Dr. Mohammad Shafiullah',
    role: 'teacher',
    bloodType: 'A+',
    departmentOrOffice: 'Department of Statistics',
    hallOrResidence: 'Teacher Quarter, Block B',
    studentOrStaffId: 'JU-FAC-9912',
    phone: '01817-554433',
    isAvailable: true,
    totalDonations: 14,
    lastDonationDate: '05 Jun 2026',
    verifiedJu: true,
  },
  {
    id: 'donor-3',
    name: 'Nusrat Jahan Mim',
    role: 'student',
    bloodType: 'B+',
    departmentOrOffice: 'Pharmacy (50th Batch)',
    hallOrResidence: 'Jahanara Imam Hall',
    studentOrStaffId: 'JU-2021-PHR-019',
    phone: '01911-778899',
    isAvailable: true,
    totalDonations: 3,
    lastDonationDate: '28 Apr 2026',
    verifiedJu: true,
  },
  {
    id: 'donor-4',
    name: 'Khorshed Alam',
    role: 'staff',
    bloodType: 'O+',
    departmentOrOffice: 'Proctor Office & Security',
    hallOrResidence: 'Transport Area Staff Quarters',
    studentOrStaffId: 'JU-STF-4301',
    phone: '01612-445566',
    isAvailable: true,
    totalDonations: 9,
    lastDonationDate: '19 Jul 2026',
    verifiedJu: true,
  },
  {
    id: 'donor-5',
    name: 'Fariha Tasnim',
    role: 'student',
    bloodType: 'AB+',
    departmentOrOffice: 'Economics (51st Batch)',
    hallOrResidence: 'Begum Khaleda Zia Hall',
    studentOrStaffId: 'JU-2022-ECO-088',
    phone: '01518-990011',
    isAvailable: false,
    totalDonations: 2,
    lastDonationDate: '02 Oct 2026',
    verifiedJu: true,
  },
  {
    id: 'donor-6',
    name: 'Zahid Hasan Rony',
    role: 'student',
    bloodType: 'O-',
    departmentOrOffice: 'Mathematics (49th Batch)',
    hallOrResidence: 'Mir Mosharraf Hossain Hall',
    studentOrStaffId: 'JU-2020-MAT-031',
    phone: '01799-332211',
    isAvailable: true,
    totalDonations: 5,
    lastDonationDate: '10 May 2026',
    verifiedJu: true,
  },
  {
    id: 'donor-7',
    name: 'Prof. Shamima Sultana',
    role: 'teacher',
    bloodType: 'B-',
    departmentOrOffice: 'Bangla Department',
    hallOrResidence: 'Teacher Residence, Flat 4A',
    studentOrStaffId: 'JU-FAC-8810',
    phone: '01819-334455',
    isAvailable: true,
    totalDonations: 8,
    lastDonationDate: '14 Feb 2026',
    verifiedJu: true,
  },
];

const MOCK_DRIVES: BloodDrive[] = [
  {
    id: 'drv-ju-1',
    title: 'JU Central Shaheed Minar Blood Camp',
    venue: 'Shaheed Minar Premises • Mobile Unit',
    date: 'Today, Oct 20',
    time: '10:00 AM – 5:00 PM',
    slotsRemaining: 12,
    totalSlots: 45,
    coordinator: 'Bandhan JU Unit & Red Crescent',
    isBooked: false,
  },
  {
    id: 'drv-ju-2',
    title: 'Transport Chottor Emergency Blood Camp',
    venue: 'Transport Yard Open Stage',
    date: 'Wednesday, Oct 22',
    time: '9:30 AM – 3:30 PM',
    slotsRemaining: 18,
    totalSlots: 50,
    coordinator: 'JU Voluntary Blood Donors Forum',
    isBooked: false,
  },
  {
    id: 'drv-ju-3',
    title: 'Cafeteria & Central Library Camp',
    venue: 'Cafeteria Ground Floor Lounge',
    date: 'Saturday, Oct 25',
    time: '11:00 AM – 4:00 PM',
    slotsRemaining: 26,
    totalSlots: 60,
    coordinator: 'JU Medical Centre Support Team',
    isBooked: false,
  },
];

const MOCK_PROFILE: DonorProfile = {
  name: 'Md. Saidul Bashar',
  role: 'student',
  studentId: 'JU-2019-CSE-042',
  donorId: 'JU-SETU-4809',
  departmentOrOffice: 'Computer Science & Engineering (48th)',
  hallOrResidence: 'Al-Beruni Hall, Room 314',
  phone: '01700-112233',
  bloodType: 'O-',
  rhFactor: 'Rh-',
  isUniversal: true,
  status: 'Eligible',
  statusDetails: 'বিশ্রাম কাল সমাপ্ত • জাহাঙ্গীরনগর বিশ্ববিদ্যালয় ভেরিফাইড ডোনার',
  daysUntilEligible: 0,
  totalDonations: 6,
  livesSaved: 18,
  campusRank: 8,
  currentStreak: 4,
  lastDonationDate: '12 Aug 2026',
  records: [
    {
      id: 'rec-1',
      date: '12 Aug 2026',
      hospital: 'Jahangirnagar University Medical Centre',
      units: 1,
      component: 'Whole Blood (Emergency)',
    },
    {
      id: 'rec-2',
      date: '24 Apr 2026',
      hospital: 'Enam Medical College & Hospital',
      units: 1,
      component: 'Whole Blood (Surgery)',
    },
    {
      id: 'rec-3',
      date: '08 Jan 2026',
      hospital: 'Shaheed Minar Annual Blood Camp',
      units: 1,
      component: 'Whole Blood (Voluntary)',
    },
  ],
};

class BloodService {
  private requests: BloodRequest[] = [...MOCK_REQUESTS];
  private donors: JuDonor[] = [...MOCK_DONORS];
  private drives: BloodDrive[] = [...MOCK_DRIVES];
  private profile: DonorProfile = { ...MOCK_PROFILE };

  async getRequests(): Promise<BloodRequest[]> {
    return new Promise(resolve => setTimeout(() => resolve([...this.requests]), 120));
  }

  async createRequest(
    payload: Omit<BloodRequest, 'id' | 'timeAgo' | 'respondersCount' | 'userStatus' | 'createdAt' | 'activeResponders'>
  ): Promise<BloodRequest> {
    const newRequest: BloodRequest = {
      ...payload,
      id: `req-${Date.now()}`,
      timeAgo: 'Just now',
      respondersCount: 0,
      userStatus: 'none',
      createdAt: new Date().toISOString(),
      activeResponders: [],
    };
    this.requests = [newRequest, ...this.requests];
    return newRequest;
  }

  async updateResponderStatus(requestId: string, status: ResponderStatus): Promise<BloodRequest | undefined> {
    const index = this.requests.findIndex(r => r.id === requestId);
    if (index === -1) return undefined;

    const current = this.requests[index];
    const wasResponded = current.userStatus !== 'none';
    const isNowResponded = status !== 'none';
    const delta = !wasResponded && isNowResponded ? 1 : wasResponded && !isNowResponded ? -1 : 0;

    let updatedActive = [...(current.activeResponders || [])];
    const userResponderIndex = updatedActive.findIndex(a => a.id === 'current-user-responder');

    if (status === 'none') {
      if (userResponderIndex !== -1) {
        updatedActive.splice(userResponderIndex, 1);
      }
    } else {
      const responderItem = {
        id: 'current-user-responder',
        name: this.profile.name,
        role: this.profile.role,
        departmentOrOffice: this.profile.departmentOrOffice,
        phone: this.profile.phone,
        status,
        eta: status === 'arrived' ? 'Arrived on scene' : status === 'donated' ? 'Donated' : '10-15 mins',
        updatedAt: 'Just now',
      };
      if (userResponderIndex !== -1) {
        updatedActive[userResponderIndex] = responderItem;
      } else {
        updatedActive.unshift(responderItem);
      }
    }

    const updated: BloodRequest = {
      ...current,
      userStatus: status,
      respondersCount: Math.max(0, current.respondersCount + delta),
      activeResponders: updatedActive,
    };

    this.requests[index] = updated;
    return updated;
  }

  async getDonors(role?: JuRole, bloodType?: BloodGroup, query?: string): Promise<JuDonor[]> {
    let result = [...this.donors];
    if (role) {
      result = result.filter(d => d.role === role);
    }
    if (bloodType) {
      result = result.filter(d => d.bloodType === bloodType);
    }
    if (query && query.trim().length > 0) {
      const q = query.toLowerCase();
      result = result.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.departmentOrOffice.toLowerCase().includes(q) ||
          d.hallOrResidence.toLowerCase().includes(q) ||
          d.bloodType.toLowerCase().includes(q)
      );
    }
    return result;
  }

  async getDrives(): Promise<BloodDrive[]> {
    return [...this.drives];
  }

  async toggleDriveBooking(driveId: string): Promise<BloodDrive | undefined> {
    const index = this.drives.findIndex(d => d.id === driveId);
    if (index === -1) return undefined;

    const current = this.drives[index];
    const newBooked = !current.isBooked;
    const updated: BloodDrive = {
      ...current,
      isBooked: newBooked,
      slotsRemaining: newBooked ? Math.max(0, current.slotsRemaining - 1) : current.slotsRemaining + 1,
    };
    this.drives[index] = updated;
    return updated;
  }

  async getProfile(): Promise<DonorProfile> {
    return { ...this.profile };
  }

  async updateProfile(updates: Partial<DonorProfile>): Promise<DonorProfile> {
    this.profile = { ...this.profile, ...updates };
    return { ...this.profile };
  }
}

export const bloodService = new BloodService();
