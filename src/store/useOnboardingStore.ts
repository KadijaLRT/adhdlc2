import { create } from 'zustand';
import type {
  EnergyLevel, AgeBracket, ReminderStyle,
  Gender, WeightGoalDirection, BodyType, ActivityLevel,
} from './index';
import type { BloodType } from '@/content/bloodTypeAffinities';

export type CoachingStyle = 'gentle' | 'funny' | 'reality_check' | 'friend' | 'scientific';

interface OnboardingState {
  displayName: string;
  ageBracket: AgeBracket | null;
  biggestHurdle: string;
  selectedModules: string[];
  energyBaseline: EnergyLevel;
  stressThreshold: EnergyLevel;
  adhdSymptoms: string[];
  brainTypes: string[];
  supportMethods: string[];
  priorities: string[];
  gender: Gender;
  weightGoalDirections: WeightGoalDirection[];
  startingWeightLbs: string;
  bodyType: BodyType | null;
  activityLevel: ActivityLevel | null;
  exerciseGoals: string[];
  focusAreas: string[];
  bloodType: BloodType | null;
  heightFt: string;
  heightIn: string;
  foodsLoved: string;
  foodsAvoided: string;
  allergies: string;
  cycleTrackingEnabled: boolean;
  reminderStyle: ReminderStyle | null;
  coachingStyle: CoachingStyle | null;

  setField: <K extends string>(key: K, value: any) => void;
  toggleInList: (key: 'adhdSymptoms' | 'brainTypes' | 'supportMethods' | 'priorities' | 'exerciseGoals' | 'focusAreas' | 'selectedModules', value: string) => void;
  reset: () => void;
}

const DEFAULTS = {
  displayName: '', ageBracket: null as AgeBracket | null, biggestHurdle: '',
  selectedModules: [] as string[],
  energyBaseline: 'medium' as EnergyLevel, stressThreshold: 'medium' as EnergyLevel,
  adhdSymptoms: [] as string[], brainTypes: [] as string[],
  supportMethods: [] as string[], priorities: [] as string[],
  gender: null as Gender, weightGoalDirections: [] as WeightGoalDirection[],
  startingWeightLbs: '', bodyType: null as BodyType | null, activityLevel: null as ActivityLevel | null,
  exerciseGoals: [] as string[], focusAreas: [] as string[],
  bloodType: null as BloodType | null, heightFt: '', heightIn: '',
  foodsLoved: '', foodsAvoided: '', allergies: '',
  cycleTrackingEnabled: false, reminderStyle: null as ReminderStyle | null,
  coachingStyle: null as CoachingStyle | null,
};

// Transient draft state for the whole onboarding flow — not persisted
// through the repository, since it's discarded once onboarding
// finishes and every answer is committed into its real, permanent home
// (profile, fitnessPreferences, nutritionPreferences, etc).
export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  ...DEFAULTS,

  setField: (key, value) => set({ [key]: value } as any),

  toggleInList: (key, value) => {
    const current = (get() as any)[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    set({ [key]: next } as any);
  },

  reset: () => set({ ...DEFAULTS }),
}));
