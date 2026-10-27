import { Redirect } from 'expo-router';

export default function LibraryContributeRoute() {
  return <Redirect href="/(tabs)/library?section=contribute&contribute=true" />;
}
