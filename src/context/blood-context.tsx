import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BloodDrive,
  BloodGroup,
  BloodRequest,
  DonorProfile,
  JuDonor,
  JuRole,
  ResponderStatus,
} from '@/types/blood';
import { bloodService } from '@/services/api/blood-service';

const ONBOARDING_STORAGE_KEY = '@setu_has_seen_onboarding_v1';

interface BloodContextType {
  requests: BloodRequest[];
  donors: JuDonor[];
  drives: BloodDrive[];
  profile: DonorProfile;
  isLoading: boolean;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
  selectedTrackingRequest: BloodRequest | null;
  setSelectedTrackingRequest: (req: BloodRequest | null) => void;
  createRequest: (
    newReq: Omit<BloodRequest, 'id' | 'timeAgo' | 'respondersCount' | 'userStatus' | 'createdAt' | 'activeResponders'>
  ) => Promise<void>;
  updateResponseStatus: (requestId: string, status: ResponderStatus) => Promise<void>;
  toggleBookDrive: (driveId: string) => Promise<void>;
  updateProfile: (updates: Partial<DonorProfile>) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const BloodContext = createContext<BloodContextType | undefined>(undefined);

export function BloodProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<JuDonor[]>([]);
  const [drives, setDrives] = useState<BloodDrive[]>([]);
  const [profile, setProfile] = useState<DonorProfile>({
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
    records: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  // Default to false so emergency users are never blocked unnecessarily
  const [showSplash, setShowSplashState] = useState(false);
  const [selectedTrackingRequest, setSelectedTrackingRequest] = useState<BloodRequest | null>(null);

  const setShowSplash = (show: boolean) => {
    setShowSplashState(show);
    if (!show) {
      // Mark as seen so it never auto-shows on future launches
      AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true').catch(() => {});
    }
  };

  const refreshAll = async () => {
    try {
      const [reqData, donorData, driveData, profData, hasSeenOnboarding] = await Promise.all([
        bloodService.getRequests(),
        bloodService.getDonors(),
        bloodService.getDrives(),
        bloodService.getProfile(),
        AsyncStorage.getItem(ONBOARDING_STORAGE_KEY).catch(() => 'true'),
      ]);
      setRequests(reqData);
      setDonors(donorData);
      setDrives(driveData);
      setProfile(profData);

      // Only auto-show for first-time installation
      if (!hasSeenOnboarding) {
        setShowSplashState(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const createRequest = async (
    newReq: Omit<BloodRequest, 'id' | 'timeAgo' | 'respondersCount' | 'userStatus' | 'createdAt' | 'activeResponders'>
  ) => {
    const created = await bloodService.createRequest(newReq);
    setRequests(prev => [created, ...prev]);
  };

  const updateResponseStatus = async (requestId: string, status: ResponderStatus) => {
    const updated = await bloodService.updateResponderStatus(requestId, status);
    if (updated) {
      setRequests(prev => prev.map(r => (r.id === requestId ? updated : r)));
      if (selectedTrackingRequest && selectedTrackingRequest.id === requestId) {
        setSelectedTrackingRequest(updated);
      }
    }
  };

  const toggleBookDrive = async (driveId: string) => {
    const updated = await bloodService.toggleDriveBooking(driveId);
    if (updated) {
      setDrives(prev => prev.map(d => (d.id === driveId ? updated : d)));
    }
  };

  const updateProfile = async (updates: Partial<DonorProfile>) => {
    const updated = await bloodService.updateProfile(updates);
    setProfile(updated);
  };

  return (
    <BloodContext.Provider
      value={{
        requests,
        donors,
        drives,
        profile,
        isLoading,
        showSplash,
        setShowSplash,
        selectedTrackingRequest,
        setSelectedTrackingRequest,
        createRequest,
        updateResponseStatus,
        toggleBookDrive,
        updateProfile,
        refreshAll,
      }}>
      {children}
    </BloodContext.Provider>
  );
}

export function useBlood() {
  const context = useContext(BloodContext);
  if (!context) {
    throw new Error('useBlood must be used within a BloodProvider');
  }
  return context;
}
