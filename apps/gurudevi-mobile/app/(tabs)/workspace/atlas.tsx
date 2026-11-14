// apps/gurudevi-mobile/app/(tabs)/workspace/atlas.tsx
// Workspace Tab Route for School Atlas & Spatial Cartography

import { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import React from 'react';
import { SchoolAtlasMapScreen } from '@/screens/atlas/SchoolAtlasMapScreen';

export { RouteErrorBoundary as ErrorBoundary };

export default function WorkspaceAtlasRoute() {
  return <SchoolAtlasMapScreen />;
}
