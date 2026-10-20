import React, { useEffect } from 'react';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import AppTabs from '@/components/app-tabs';
import { OnboardingSlider } from '@/components/onboarding-slider';
import { RequestTrackingModal } from '@/components/request-tracking-modal';
import { BloodProvider, useBlood } from '@/context/blood-context';

SplashScreen.preventAutoHideAsync();

function MainContent() {
  const {
    showSplash,
    setShowSplash,
    selectedTrackingRequest,
    setSelectedTrackingRequest,
    updateResponseStatus,
    isLoading,
  } = useBlood();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  return (
    <>
      <StatusBar style="light" />
      <AppTabs />
      <OnboardingSlider visible={showSplash} onFinish={() => setShowSplash(false)} />
      <RequestTrackingModal
        visible={!!selectedTrackingRequest}
        request={selectedTrackingRequest}
        onClose={() => setSelectedTrackingRequest(null)}
        onUpdateStatus={updateResponseStatus}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <BloodProvider>
        <MainContent />
      </BloodProvider>
    </ThemeProvider>
  );
}
