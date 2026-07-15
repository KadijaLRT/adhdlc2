import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

// Five tabs, matching the document's IA: Home (command center), Today
// (execution hub for tasks/focus/routines), Meals (recipes/groceries),
// Wellness (mood/workout/coach), Profile. Everything else launches from
// one of these hubs rather than competing for its own permanent tab.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#818cf8',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#fafaf9', borderTopColor: '#e7e5e4' },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: () => <TabIcon emoji="🏠" /> }} />
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: () => <TabIcon emoji="✅" /> }} />
      <Tabs.Screen name="meals" options={{ title: 'Meals', tabBarIcon: () => <TabIcon emoji="🍽️" /> }} />
      <Tabs.Screen name="wellness" options={{ title: 'Wellness', tabBarIcon: () => <TabIcon emoji="❤️" /> }} />
      <Tabs.Screen name="profile" options={{ title: 'You', tabBarIcon: () => <TabIcon emoji="👤" /> }} />
    </Tabs>
  );
}
