import { Text, type TextProps } from 'react-native';
import { useAppStore, selectTextSize, selectHighContrast, type TextSize } from '@/store/index';
import { TEXT_SCALE } from '@/shared/theme/tokens';

// One step up/down per role for 'large'/'small' Text Size, matching the
// Accessibility screen's three-level scale (small/medium/large) onto
// this design system's own three typographic roles. 'medium' Text Size
// is exactly the static TEXT_SCALE default, so nothing changes for
// anyone who hasn't touched the setting.
const SIZE_CLASSES: Record<'large' | 'medium' | 'small', Record<TextSize, string>> = {
  large: { small: 'text-xl', medium: 'text-2xl', large: 'text-3xl' },
  medium: { small: 'text-sm', medium: 'text-base', large: 'text-lg' },
  small: { small: 'text-[10px]', medium: 'text-xs', large: 'text-sm' },
};

// Default color per role, same as the static TEXT_SCALE constant.
const DEFAULT_COLOR: Record<'large' | 'medium' | 'small', string> = {
  large: 'text-slate-900 dark:text-slate-100',
  medium: 'text-slate-900 dark:text-slate-100',
  small: 'text-slate-400',
};

// High Contrast pushes the two roles that normally sit at a softer
// gray (Caption's slate-400, and dark-mode's slate-100) to the actual
// extremes of the palette. Heading/medium in light mode is already
// slate-900 (near-black), so it's left alone — there's no meaningfully
// higher-contrast step to take there.
const HIGH_CONTRAST_COLOR: Record<'large' | 'medium' | 'small', string> = {
  large: 'text-black dark:text-white',
  medium: 'text-black dark:text-white',
  small: 'text-slate-700 dark:text-slate-200',
};

/**
 * Reads Text Size and High Contrast from Accessibility settings and
 * returns className strings for the three typographic roles, so any
 * consumer of these (Heading/Subheading/Caption, used across the
 * hub screens and picked up incrementally elsewhere) actually responds
 * to those two preferences instead of always rendering the static
 * TEXT_SCALE default.
 */
export function useTextScale() {
  const textSize = useAppStore(selectTextSize);
  const highContrast = useAppStore(selectHighContrast);

  const build = (role: 'large' | 'medium' | 'small', weightClass: string) => {
    const sizeClass = SIZE_CLASSES[role][textSize];
    const colorClass = highContrast ? HIGH_CONTRAST_COLOR[role] : DEFAULT_COLOR[role];
    return `${colorClass} ${sizeClass} ${weightClass}`.trim();
  };

  return {
    large: build('large', 'font-semibold'),
    medium: build('medium', 'font-semibold'),
    small: build('small', ''),
  };
}

export function Heading(props: TextProps) {
  const scale = useTextScale();
  return <Text {...props} className={`${scale.large} ${props.className || ''}`} />;
}
export function Subheading(props: TextProps) {
  const scale = useTextScale();
  return <Text {...props} className={`${scale.medium} ${props.className || ''}`} />;
}
export function Caption(props: TextProps) {
  const scale = useTextScale();
  return <Text {...props} className={`${scale.small} ${props.className || ''}`} />;
}
