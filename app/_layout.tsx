import '../global.css';
import { useEffect, useState } from 'react';
import { Stack, usePathname } from 'expo-router';
import { View, Text } from 'react-native';
import { useFonts, Lexend_400Regular, Lexend_600SemiBold } from '@expo-google-fonts/lexend';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore, selectDyslexiaFont } from '@/store/index';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import AvivaFloatingButton from '@/features/aviva/AvivaFloatingButton';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const dyslexiaFont = useAppStore(selectDyslexiaFont);
  const [fontsLoaded] = useFonts({ Lexend_400Regular, Lexend_600SemiBold });

  // Overwhelmed Mode is designed with zero nav/menus visible. Aviva
  // shouldn't appear during onboarding either — she's introduced once
  // setup is done, not as a floating distraction while answering setup
  // questions.
  const hideFloatingButton = pathname?.startsWith('/overwhelmed') || pathname?.startsWith('/onboarding');

  useEffect(() => {
    useAppStore.getState().hydrate();
  }, []);

  // Applies Lexend app-wide via React Native's Text.defaultProps, rather
  // than needing to individually update every <Text> across ~50 screens.
  // This is a genuinely global switch, not a partial one, as long as
  // components use the standard <Text> from react-native (which every
  // screen in this app does).
  useEffect(() => {
    if (!fontsLoaded) return;
    const anyText = Text as any;
    anyText.defaultProps = anyText.defaultProps || {};
    anyText.defaultProps.style = dyslexiaFont
      ? [anyText.defaultProps.style, { fontFamily: 'Lexend_400Regular' }]
      : undefined;
  }, [dyslexiaFont, fontsLoaded]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <View className="flex-1">
          <Stack screenOptions={{ headerShown: false }} />
          {!hideFloatingButton && <AvivaFloatingButton />}
        </View>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
