/**
 * Single source of truth for the design system's typography and color
 * scale, per the "three sizes only, reduced color set" principle.
 * Applied directly to the five hub screens (Home, Today, Meals,
 * Wellness, Profile) in this pass; every other existing screen still
 * uses its own inline Tailwind classes and should be migrated to these
 * tokens incrementally, not all at once.
 *
 * Kept as the static default (Accessibility → Text Size on "medium",
 * High Contrast off). Anywhere that needs to actually respond to the
 * person's Text Size / High Contrast settings should use
 * `useTextScale()` in Heading.tsx instead — this constant stays for
 * any caller that genuinely wants the fixed default regardless of
 * preferences.
 */
export const TEXT_SCALE = {
  large: 'text-slate-900 dark:text-slate-100 text-2xl font-semibold',
  medium: 'text-slate-900 dark:text-slate-100 text-base font-semibold',
  small: 'text-slate-400 text-xs',
};

// Reduced palette: one primary color, plus success/warning/info as the
// only accent departures. Note: this app deliberately has no "error"
// red used for incomplete/missed states — that would conflict with the
// zero-guilt architecture rule, which outranks strict adherence to a
// generic design system. Red is reserved only for genuinely destructive
// confirmations if ever needed, never for "you didn't do this."
export const COLORS = {
  primary: '#6366f1', // indigo-500
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  info: '#38bdf8', // sky-400, used sparingly for neutral info states
  background: '#fafaf9', // stone-50 base
  surface: '#ffffff', // white cards
};
