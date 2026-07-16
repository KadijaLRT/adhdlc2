import type { UnitSystem } from '@/store/slices/settingsSlice';

const LBS_PER_KG = 2.20462;

/** Weight is always stored in lbs internally — this only affects display. */
export function formatWeight(weightLbs: number, unitSystem: UnitSystem = 'imperial'): string {
  if (unitSystem === 'metric') {
    return `${(weightLbs / LBS_PER_KG).toFixed(1)} kg`;
  }
  return `${Math.round(weightLbs * 10) / 10} lbs`;
}

/** Bare number only (no unit label), for contexts that already show a unit separately. */
export function convertWeightForDisplay(weightLbs: number, unitSystem: UnitSystem = 'imperial'): number {
  if (unitSystem === 'metric') {
    return Math.round((weightLbs / LBS_PER_KG) * 10) / 10;
  }
  return Math.round(weightLbs * 10) / 10;
}

/** Converts a value entered in the display unit back to lbs for storage. */
export function parseWeightToLbs(value: number, unitSystem: UnitSystem = 'imperial'): number {
  if (unitSystem === 'metric') {
    return Math.round(value * LBS_PER_KG * 10) / 10;
  }
  return value;
}

export function weightUnitLabel(unitSystem: UnitSystem = 'imperial'): string {
  return unitSystem === 'metric' ? 'kg' : 'lbs';
}

const CM_PER_INCH = 2.54;

/** Body measurements are always stored in inches internally — this only affects display. */
export function convertLengthForDisplay(inches: number, unitSystem: UnitSystem = 'imperial'): number {
  if (unitSystem === 'metric') {
    return Math.round(inches * CM_PER_INCH * 10) / 10;
  }
  return Math.round(inches * 10) / 10;
}

/** Converts a value entered in the display unit back to inches for storage. */
export function parseLengthToInches(value: number, unitSystem: UnitSystem = 'imperial'): number {
  if (unitSystem === 'metric') {
    return Math.round((value / CM_PER_INCH) * 10) / 10;
  }
  return value;
}

export function lengthUnitLabel(unitSystem: UnitSystem = 'imperial'): string {
  return unitSystem === 'metric' ? 'cm' : 'in';
}
