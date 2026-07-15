import '../global.css';
import { useEffect, useState } from 'react';
import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/index';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import AvivaFloatingButton from '@/features/aviva/AvivaFloatingButton';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  // Overwhelmed Mode is designed with zero nav/menus visible, per its
  // own screen — the global floating button would defeat that.
  const hideFloatingButton = pathname?.startsWith('/overwhelmed');

  useEffect(() => {
    useAppStore.getState().hydrate();
  }, []);

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
