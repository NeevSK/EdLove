import AppSettingsScreen from '@repo/ui/screens/AppSettingsScreen';
import { router } from 'expo-router';

const navigation = {
  navigate: (screen: string) => {
    if (screen === 'Community') {
      router.push('/community');
      return;
    }

    if (screen === 'TrubeLab') {
      router.push('/a-i-assistant');
      return;
    }

    router.push('/community');
  },
};

export default function AppSettingsRoute() {
  return <AppSettingsScreen navigation={navigation} />;
}
