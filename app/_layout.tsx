import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/index';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import AvivaFloatingButton from '@/features/aviva/AvivaFloatingButton';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    useAppStore.getState().hydrate();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <View className="flex-1">
          <Stack screenOptions={{ headerShown: false }} />
          <AvivaFloatingButton />
        </View>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
