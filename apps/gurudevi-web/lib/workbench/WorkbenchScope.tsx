'use client';

import { createContext, useContext, type ReactNode } from 'react';

type WorkbenchScope = 'explore' | 'sanctuary';
const WorkbenchScopeContext = createContext<WorkbenchScope>('sanctuary');

export function WorkbenchScopeProvider({
  children,
  scope,
}: Readonly<{ children: ReactNode; scope: WorkbenchScope }>) {
  return <WorkbenchScopeContext.Provider value={scope}>{children}</WorkbenchScopeContext.Provider>;
}

export function useWorkbenchScope(): WorkbenchScope {
  return useContext(WorkbenchScopeContext);
}
