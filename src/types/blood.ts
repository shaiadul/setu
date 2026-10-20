export type JuRole = 'student' | 'teacher' | 'staff';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

export type UrgencyLevel = 'Code Red' | 'Urgent' | 'Standard';

export type CaseType =
  | 'Emergency Surgery'
  | 'Thalassemia'
  | 'Trauma / Accident'
  | 'Dengue Platelets'
  | 'Maternity'
  | 'ICU Critical';

export type ResponderStatus = 'none' | 'en_route' | 'arrived' | 'donated';

export interface ActiveResponder {
  id: string;
  name: string;
  role: JuRole;
  departmentOrOffice: string;
  phone: string;
  status: ResponderStatus;
  eta: string;
  updatedAt: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  hospital: string;
  campusArea: string;
  room: string;
  distance: string;
  requiredUnits: number;
  bloodType: BloodGroup;
  urgency: UrgencyLevel;
  caseType: CaseType;
  description: string;
  timeAgo: string;
  respondersCount: number;
  userStatus: ResponderStatus;
  contactNumber: string;
  requesterRole: JuRole;
  requesterDepartment: string;
  requesterHallOrOffice: string;
  activeResponders?: ActiveResponder[];
  createdAt: string;
}

export interface JuDonor {
  id: string;
  name: string;
  role: JuRole;
  bloodType: BloodGroup;
  departmentOrOffice: string;
  hallOrResidence: string;
  studentOrStaffId: string;
  phone: string;
  isAvailable: boolean;
  totalDonations: number;
  lastDonationDate: string;
  verifiedJu: boolean;
}

export interface BloodDrive {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  slotsRemaining: number;
  totalSlots: number;
  coordinator: string;
  isBooked: boolean;
}

export interface DonationRecord {
  id: string;
  date: string;
  hospital: string;
  units: number;
  component: string;
}

export interface DonorProfile {
  name: string;
  role: JuRole;
  studentId: string;
  donorId: string;
  departmentOrOffice: string;
  hallOrResidence: string;
  phone: string;
  bloodType: BloodGroup;
  rhFactor: string;
  isUniversal: boolean;
  status: 'Eligible' | 'Rest Period' | 'Screening Needed';
  statusDetails: string;
  daysUntilEligible: number;
  totalDonations: number;
  livesSaved: number;
  campusRank: number;
  currentStreak: number;
  lastDonationDate: string;
  records: DonationRecord[];
}
