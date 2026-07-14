import { Text, type TextProps } from 'react-native';
import { TEXT_SCALE } from '@/shared/theme/tokens';

export function Heading(props: TextProps) {
  return <Text {...props} className={`${TEXT_SCALE.large} ${props.className || ''}`} />;
}
export function Subheading(props: TextProps) {
  return <Text {...props} className={`${TEXT_SCALE.medium} ${props.className || ''}`} />;
}
export function Caption(props: TextProps) {
  return <Text {...props} className={`${TEXT_SCALE.small} ${props.className || ''}`} />;
}
