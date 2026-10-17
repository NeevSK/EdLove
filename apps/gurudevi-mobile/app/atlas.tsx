// apps/gurudevi-mobile/app/atlas.tsx
// Top-level Expo Router route for School Atlas & Spatial Cartography

import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import React from 'react';
import { SchoolAtlasMapScreen } from '@/screens/atlas/SchoolAtlasMapScreen';

export { RouteErrorBoundary as ErrorBoundary };

export default function AtlasRoute() {
  return <SchoolAtlasMapScreen />;
}
