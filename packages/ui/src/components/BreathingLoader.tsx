import { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { WaitingSign } from '../world/native/WaitingSign';

interface BreathingLoaderProps {
  size?: number;
  /** No longer used: the world decides the sign's colours. */
  color?: string;
}

/** Kept for existing screens: a compact waiting sign in the active world. */
const BreathingLoader: FC<BreathingLoaderProps> = ({ size = 50 }) => {
  const { t } = useTranslation();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t('accessibility.loading')}
      style={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <WaitingSign size={size} />
    </View>
  );
};

export default BreathingLoader;
