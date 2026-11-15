import { Redirect } from 'expo-router';
import { FloorLab } from './FloorLab';

/** Development route for the floor engine; release builds redirect away. */
export default function FloorLabRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <FloorLab />;
}
