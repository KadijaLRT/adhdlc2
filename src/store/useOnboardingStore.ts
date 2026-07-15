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
  goalWeightLbs: string;
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
  sleepStruggles: string[];
  wantsMedicationReminders: boolean | null;
  medicationCount: string;
  medicationTimes: string;
  emotionalRegulationHelpers: string[];
  moduleScreenQueue: string[];

  setField: <K extends string>(key: K, value: any) => void;
  toggleInList: (key: 'adhdSymptoms' | 'brainTypes' | 'supportMethods' | 'priorities' | 'exerciseGoals' | 'focusAreas' | 'selectedModules' | 'sleepStruggles' | 'emotionalRegulationHelpers', value: string) => void;
  buildModuleScreenQueue: () => void;
  goToNextModuleScreen: (router: { push: (href: string) => void; replace?: (href: string) => void }) => void;
  reset: () => void;
}

// Maps each selectable module to the screen it unlocks. Order here is
// the order screens appear in. Modules with no dedicated screen yet
// (work, school, home, planning) simply don't add anything to the
// queue — recorded as a priority, nothing more, until they get one.
const MODULE_SCREEN_MAP: Record<string, string> = {
  fitness: '/onboarding/body',
  nutrition: '/onboarding/food',
  sleep: '/onboarding/sleep',
  medication: '/onboarding/medication',
  emotional_regulation: '/onboarding/emotional-regulation',
};

const DEFAULTS = {
  displayName: '', ageBracket: null as AgeBracket | null, biggestHurdle: '',
  selectedModules: [] as string[],
  energyBaseline: 'medium' as EnergyLevel, stressThreshold: 'medium' as EnergyLevel,
  adhdSymptoms: [] as string[], brainTypes: [] as string[],
  supportMethods: [] as string[], priorities: [] as string[],
  gender: null as Gender, weightGoalDirections: [] as WeightGoalDirection[],
  startingWeightLbs: '', goalWeightLbs: '', bodyType: null as BodyType | null, activityLevel: null as ActivityLevel | null,
  exerciseGoals: [] as string[], focusAreas: [] as string[],
  bloodType: null as BloodType | null, heightFt: '', heightIn: '',
  foodsLoved: '', foodsAvoided: '', allergies: '',
  cycleTrackingEnabled: false, reminderStyle: null as ReminderStyle | null,
  coachingStyle: null as CoachingStyle | null,
  sleepStruggles: [] as string[],
  wantsMedicationReminders: null as boolean | null,
  medicationCount: '', medicationTimes: '',
  emotionalRegulationHelpers: [] as string[],
  moduleScreenQueue: [] as string[],
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

  // Called once, right after the module-selection screen. Computes the
  // exact ordered list of conditional screens this person needs to see —
  // nothing more, nothing less than what they actually selected.
  buildModuleScreenQueue: () => {
    const selected = get().selectedModules || [];
    const queue = Object.entries(MODULE_SCREEN_MAP)
      .filter(([moduleId]) => selected.includes(moduleId))
      .map(([, screen]) => screen);
    set({ moduleScreenQueue: queue });
  },

  // Every conditional screen calls this on Continue instead of hardcoding
  // "what's next" — it just pops the queue. When it's empty, onward to
  // the final step. Adding a new conditional module later means adding
  // one line to MODULE_SCREEN_MAP, not editing every screen's routing.
  goToNextModuleScreen: (router) => {
    const queue = get().moduleScreenQueue || [];
    const [next, ...rest] = queue;
    set({ moduleScreenQueue: rest });
    if (next) {
      router.push(next);
    } else {
      router.push('/onboarding/final');
    }
  },

  reset: () => set({ ...DEFAULTS }),
}));
