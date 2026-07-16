import { useLocalSearchParams } from 'expo-router';
import RecipeDetailScreen from '@/features/nutrition/RecipeDetailScreen';

export default function RecipeDetailRoute() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  return <RecipeDetailScreen recipeId={recipeId || ''} />;
}
