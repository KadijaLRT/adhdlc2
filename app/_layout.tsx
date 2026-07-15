import '../global.css';
import { useEffect, useState } from 'react';
import { Stack, usePathname } from 'expo-router';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useFonts, Lexend_400Regular, Lexend_600SemiBold } from '@expo-google-fonts/lexend';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore, selectDyslexiaFont, selectColorScheme } from '@/store/index';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import AvivaFloatingButton from '@/features/aviva/AvivaFloatingButton';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const dyslexiaFont = useAppStore(selectDyslexiaFont);
  const colorSchemePreference = useAppStore(selectColorScheme);
  const { setColorScheme } = useColorScheme();
  const [fontsLoaded] = useFonts({ Lexend_400Regular, Lexend_600SemiBold });

  // Onboarding intentionally stays dark regardless of the app-wide
  // setting — it's a fixed, deliberate design choice for that flow, not
  // something the light/dark toggle should touch.
  const isOnboarding = pathname?.startsWith('/onboarding');

  // Overwhelmed Mode is designed with zero nav/menus visible. Aviva
  // shouldn't appear during onboarding either — she's introduced once
  // setup is done, not as a floating distraction while answering setup
  // questions.
  const hideFloatingButton = pathname?.startsWith('/overwhelmed') || pathname?.startsWith('/onboarding');

  useEffect(() => {
    useAppStore.getState().hydrate();
  }, []);

  // Drives NativeWind's actual dark-mode class toggling from the
  // person's stored preference. 'system' defers to the OS/browser
  // setting via NativeWind's own system-scheme detection.
  useEffect(() => {
    if (isOnboarding) {
      setColorScheme('dark');
      return;
    }
    setColorScheme(colorSchemePreference);
  }, [colorSchemePreference, isOnboarding]);

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
